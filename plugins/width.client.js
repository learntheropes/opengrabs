export default function (context) {
    context.modalWidth = (process.client) ? parseInt(window.innerWidth*0.7) : 300
  }