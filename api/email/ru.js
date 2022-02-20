import dotenv from 'dotenv'
dotenv.config()
const baseUrl = process.env.URL ? `https://${process.env.URL}` : 'https://localhost:3000'

export const emailConfirmationCode = (code) => {
    return {
        subject: 'Email confirmation code',
        content: `Your email confirmation code is ${code}`
    }
};

export const emailOrder = (locale, grabId) => {
    return {
        subject: 'New order for your travel',
        content: `A new grab has been ordered for your next travel. You can view it here: ${baseUrl}/${locale}/account/grab/${grabId}`
    }
};

export const emailBooked = (locale, grabId) => {
    return {
        subject: 'Your order has been booked',
        content: `Your order has been booked. You can view more here: ${baseUrl}/${locale}/account/grab/${grabId}`
    }
};

export const emailPaid = (locale, grabId) => {
    return {
        subject: 'Your grab has been paid',
        content: `Your grab has been paid. You can view more here: ${baseUrl}/${locale}/account/grab/${grabId}`
    }
};

export const emailDispute = (locale, grabId) => {
    return {
        subject: 'Your grab has been disputed',
        content: `Your grab has been disputed. You can view more here: ${baseUrl}/${locale}/account/grab/${grabId}`
    } 
};

export const emailBought = (locale, grabId) => {
    return {
        subject: 'Your grab has been bought',
        content: `Your grab has been bought. You can view more here: ${baseUrl}/${locale}/account/grab/${grabId}`
    } 
};

export const emailDelivered = (locale, grabId) => {
    return {
        subject: 'Your grab has been delivered',
        content: `Your grab has been delivered. You can view more here: ${baseUrl}/${locale}/account/grab/${grabId}`
    } 
};

export const emailReleased = (locale, grabId) => {
    return {
        subject: 'Your grab has been released',
        content: `Your grab has been released. You can view more here: ${baseUrl}/${locale}/account/grab/${grabId}`
    } 
};

export const emailTicketReplyed = (locale, username, ticketId) => {
    return {
        subject: 'Your ticket has been replied',
        content:
`
Hi ${username},

Your ticket has been replied.
You can view more here:
${baseUrl}/${locale}/account/tickets/${ticketId}

Cheers,
Opengrabs
`
    } 
};
