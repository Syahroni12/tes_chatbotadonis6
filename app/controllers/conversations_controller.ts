import type { HttpContextContract } from '@adonisjs/core/http'
import Conversation from '#models/conversation'
import Message from '#models/message'
import axios from 'axios'
// import { string } from '@adonisjs/core/helpers'
import { v4 as uuidv4 } from 'uuid'

export default class ConversationsController {
  public async askQuestion({ request, response }: HttpContextContract) {
    try {
      const question = request.input('question')

      if (!question || question.trim().length === 0) {
        return response.badRequest({
          status: 'error',
          message: 'Pertanyaan tidak boleh kosong',
        })
      }

      const sessionId = uuidv4()

      // Simpan session percakapan
      const conversation = await Conversation.create({ sessionId })

      // Simpan pesan user
      await conversation.related('messages').create({
        senderType: 'user',
        message: question,
      })

      // Konfigurasi request ke API Majadigi
      const apiUrl = 'https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message'

      const requestData = {
        session_id: conversation.sessionId,
        question: question,
        additional_context: '', // Sesuai spesifikasi API Majadigi
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      }

      // Kirim request ke Majadigi
      const botRes = await axios.post(apiUrl, requestData, config)

      // Debugging response
      console.log('Majadigi API Response:', JSON.stringify(botRes.data, null, 2))

      // Ambil pesan dari response
      const botMessage = botRes?.data?.data?.message?.[0]?.text?.trim()

      if (!botMessage) {
        return response.internalServerError({
          status: 'error',
          message: 'Bot tidak memberikan jawaban yang valid',
          api_response: botRes.data,
        })
      }

      // Simpan pesan dari bot
      await conversation.related('messages').create({
        senderType: 'bot',
        message: botMessage,
      })

      return response.ok({
        status: 'success',
        pertanyaan: question,
        session_id: conversation.sessionId,
        bot_message: botMessage,
        // api_response: botRes.data,
      })
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      })

      return response.internalServerError({
        status: 'error',
        message: 'Gagal memproses pertanyaan',
        error: error.message,
        api_error: error.response?.data,
      })
    }
  }

  public async getAllConversations({ request }: HttpContextContract) {
    const search = request.qs().search
    const query = Conversation.query().preload('messages')

    if (search) {
      query.where('session_id', 'ilike', `%${search}%`)
    }

    const conversations = await query
    return conversations
  }

  public async getMessagesByConversation({ params, response }: HttpContextContract) {
    try {
      // Fungsi validasi UUID manual
      const isUUID = (value: string): boolean => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
      }

      // Cek apakah params.id adalah UUID atau numeric ID
      const isValidUUID = isUUID(params.id)
      const isNumericId = !isNaN(Number(params.id))

      // Validasi input
      if (!isValidUUID && !isNumericId) {
        return response.badRequest({
          message: 'ID harus berupa angka (ID) atau UUID (sessionId)',
          receivedId: params.id,
        })
      }

      // Query conversation
      const conversation = await Conversation.query()
        .where((query) => {
          if (isNumericId) {
            query.where('id', Number(params.id)) // Cari berdasarkan ID (number)
          } else {
            query.where('sessionId', params.id) // Cari berdasarkan sessionId (UUID)
          }
        })
        .preload('messages', (messagesQuery) => {
          messagesQuery.orderBy('created_at', 'asc') // Urutkan pesan dari terlama
        })
        .firstOrFail() // Otomatis throw 404 jika tidak ditemukan

      return conversation.messages
    } catch (error) {
      // Handle error khusus untuk "not found"
      if (error.code === 'E_ROW_NOT_FOUND') {
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id)

        return response.notFound({
          message: 'Percakapan tidak ditemukan',
          debug: {
            requestedId: params.id,
            type: isUUID ? 'UUID' : 'Numeric ID',
          },
        })
      }

      // Handle error umum
      return response.internalServerError({
        message: 'Gagal mengambil pesan',
        error: error.message,
      })
    }
  }

  public async deleteConversation({ params, response }: HttpContextContract) {
    const conversation = await Conversation.findBy('session_id', params.id)
    if (!conversation) {
      return response.notFound({ message: 'Conversation not found' })
    }

    await Message.query().where('conversation_id', conversation.id).delete()
    await conversation.delete()

    return response.ok({ message: 'Conversation deleted successfully' })
  }
}
