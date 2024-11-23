import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  static targets = ["messages", "form", "input"]
  static values = {
    recipientId: String
  }

  connect() {
    this.scrollToBottom()
    
    if (this.hasRecipientIdValue) {
      this.channel = createConsumer().subscriptions.create(
        {
          channel: "ChatChannel",
          recipient_id: this.recipientIdValue
        },
        {
          connected: () => {
            console.log('Connected to chat channel')
          },
          disconnected: () => {
            console.log('Disconnected from chat channel')
          },
          received: (data) => {
            this._handleMessage(data)
          }
        }
      )
    }
  }

  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe()
    }
  }

  _handleMessage(data) {
    this.messagesTarget.insertAdjacentHTML('beforeend', data)
    this.scrollToBottom()
  }

  scrollToBottom() {
    this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
  }

  submit(event) {
    event.preventDefault()
    
    const input = this.inputTarget
    const content = input.value.trim()
    
    if (content === "") {
      return
    }

    const formData = new FormData(this.formTarget)
    
    fetch(this.formTarget.action, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
        'Accept': 'application/json'
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        input.value = ""
        input.focus()
      } else {
        console.error('Failed to send message')
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
  }
}