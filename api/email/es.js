import dotenv from 'dotenv'
dotenv.config()
const baseUrl = process.env.URL ? `https://${process.env.URL}` : 'https://localhost:3000'

export const emailConfirmationCode = (code, username) => {
  return {
    subject: 'Código de verificación de correo electrónico',
    content: (username) ?
`
Hola ${username},

Tu código de verificación es ${code}

Saludos,
${process.env.URL}
`
:
`
Hola,

Tu código de verificación es ${code}

Saludos,
${process.env.URL}
`
  }
};

export const emailOrder = (locale, grabId, username) => {
  return {
    subject: 'Nuevo pedido para tu viaje',
    content:
`
Hola ${username},

Un nuevo grab ha sido ordenado para tu próximo viaje.
Puedes verlo aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  }
};

export const emailBooked = (locale, grabId, username) => {
  return {
    subject: 'Tu orden ha sido reservada',
    content:
`
Hi ${username},

Tu orden ha sido reservada.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  }
};

export const emailPaid = (locale, grabId, username) => {
  return {
    subject: 'Tu grab ha sido pagado',
    content:
`
Hola ${username},

Tu grab ha sido pagado.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  }
};

export const emailDispute = (locale, grabId, username) => {
  return {
    subject: 'Tu grab está bajo disputa',
    content:
`
Hola ${username},

Tu grab está bajo disputa.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  } 
};

export const emailBought = (locale, grabId, username) => {
  return {
    subject: 'Tu grab ha sido comprado',
    content:
`
Hola ${username},

Tu grab ha sido comprado.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  } 
};

export const emailDelivered = (locale, grabId, username) => {
  return {
    subject: 'Tu grab ha sido entregado',
    content:
`
Hola ${username},

Tu grab ha sido entregado.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  } 
};

export const emailReleased = (locale, grabId, username) => {
  return {
    subject: 'Tu grab ha sido liberado',
    content:
`
Hola ${username},

Tu grab ha sido liberado.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  } 
};

export const emailTicketReplyed = (locale, ticketId, username) => {
  return {
    subject: 'Tu ticket ha sido respondido',
    content:
`
Hola ${username},

Tu ticket ha sido respondido.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/tickets/${ticketId}

Saludos,
${process.env.URL}
`
  } 
};

export const emailDisputeUpdated = (locale, grabId, username) => {
  return {
    subject: 'Tu disputa ha sido actualizada',
    content:
`
Hola ${username},

Tu disputa ha sido actualizada por un administrador.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  } 
};

export const emailDisputeResolved = (locale, grabId, username) => {
  return {
    subject: 'Tu disputa ha sido resuleta',
    content:
`
Hola ${username},

Tu disputa ha sido resuelta por un administrador.
Puedes ver mas aquí:
${baseUrl}/${locale}/account/grab/${grabId}

Saludos,
${process.env.URL}
`
  } 
};