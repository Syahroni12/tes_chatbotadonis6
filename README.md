cara penggunanan atau dokumentasi api di adonis js

1. end point untuk send pertanyaan (saat ini di local)
http://localhost:3333/api/questions

Request Body:
{
  "question": "aplikasi layanan nya apa saja"
}


dan responnya begini
{
    "status": "success",
    "pertanyaan": "aplikasi layanan nya apa saja",
    "session_id": "256c5511-735e-496a-a327-79051a565f4d",
    "bot_message": "Aplikasi layanan yang tersedia di Smart Kampung Banyuwangi mencakup berbagai jenis layanan administrasi, seperti:\n\n1. Pembuatan KTP\n2. Pembuatan KK\n3. Surat keterangan domisili\n4. Perizinan sekolah\n5. Pembayaran pajak dan retribusi daerah\n6. Layanan pengaduan online\n7. Sistem informasi kesehatan daera\n\nSelain itu, ada juga aplikasi Jatim Siaga dan Surabaya Single Window Alfa (SSWALFA) yang menawarkan layanan perizinan dan darurat."
}

2.  Mendapatkan Semua Percakapan
   http://localhost:3333/api/conversations
Query Parameters:

search (optional): Filter berdasarkan session_id

[
    {
        "id": 1,
        "sessionId": "1d7d48a3-15e8-4630-9e4e-e472b0f27162",
        "createdAt": "2025-05-26T02:43:57.250+00:00",
        "updatedAt": "2025-05-26T02:43:57.250+00:00",
        "messages": [
            {
                "id": 1,
                "senderType": "user",
                "message": "Halo, apa kabar?",
                "conversationId": 1,
                "createdAt": "2025-05-26T02:43:57.532+00:00",
                "updatedAt": "2025-05-26T02:43:57.532+00:00"
            },
            {
                "id": 2,
                "senderType": "bot",
                "message": "OK",
                "conversationId": 1,
                "createdAt": "2025-05-26T02:43:57.850+00:00",
                "updatedAt": "2025-05-26T02:43:57.850+00:00"
            }
        ]
    },
   
]

3. Mendapatkan Pesan dalam Percakapan
End Poin http://localhost:3333/api/conversations/2
Parameter:

id: ID percakapan (numeric) atau session_id (UUID)

Rzespon json
[
    {
        "id": 3,
        "senderType": "user",
        "message": "ada layanan apa di majadigi?",
        "conversationId": 2,
        "createdAt": "2025-05-26T02:45:40.694+00:00",
        "updatedAt": "2025-05-26T02:45:40.695+00:00"
    },
    {
        "id": 4,
        "senderType": "bot",
        "message": "OK",
        "conversationId": 2,
        "createdAt": "2025-05-26T02:45:40.908+00:00",
        "updatedAt": "2025-05-26T02:45:40.908+00:00"
    }
]

4. Mengahapus Conversation
end point
http://localhost:3333/api/conversations/37f46b00-f3bf-4cd3-8878-9ad582e1f1b5

parameter
session_id

respon
{
    "message": "Conversation deleted successfully"
}

