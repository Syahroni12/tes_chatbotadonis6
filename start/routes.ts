import router from '@adonisjs/core/services/router'
import ConversationsController from '#controllers/conversations_controller'

// Grup route dengan prefix 'api' jika diperlukan
router
  .group(() => {
    // Kirim pertanyaan ke chatbot
    router.post('/questions', [ConversationsController, 'askQuestion'])

    // Kelola conversations
    router.get('/conversations', [ConversationsController, 'getAllConversations'])
    router.get('/conversations/:id', [ConversationsController, 'getMessagesByConversation'])
    router.delete('/conversations/:id', [ConversationsController, 'deleteConversation'])

    // // Kelola messages dalam conversation
    // router.delete('/conversations/:conversationId/messages/:messageId', [
    //   ConversationsController,
    //   'destroyMessage',
    // ])
    // router.put('/conversations/:conversationId/messages/:messageId', [
    //   ConversationsController,
    //   'updateMessage',
    // ])

    // Route untuk health check
    router.get('/health', async ({ response }) => {
      return response.ok({ status: 'ok' })
    })
  })
  .prefix('/api')
