import dotenv from 'dotenv'
dotenv.config()
const baseUrl = process.env.URL ? `https://${process.env.URL}` : 'https://localhost:3000'

export const emailConfirmationCode = (code, username) => {
    return {
        subject: 'Email confirmation code',
        content: (username) ?
`
Hi ${username},

Your email confirmation code is ${code}

Cheers,
Opengrabs
`
:
`
Hi,

Your email confirmation code is ${code}

Cheers,
Opengrabs
`
    }
};

export const emailOrder = (locale, grabId, username) => {
    return {
        subject: 'New order for your travel',
        content:
`
Hi ${username},

A new grab has been ordered for your next travel.
You can view it here:
${baseUrl}/${locale}/account/grab/${grabId}

Cheers,
Opengrabs
`
    }
};

export const emailBooked = (locale, grabId, username) => {
    return {
        subject: 'Your order has been booked',
        content:
`
Hi ${username},

Your order has been booked.
You can view more here:
${baseUrl}/${locale}/account/grab/${grabId}

Cheers,
Opengrabs
`
    }
};

export const emailPaid = (locale, grabId, username) => {
    return {
        subject: 'Your grab has been paid',
        content:
`
Hi ${username},

Your grab has been paid.
You can view more here:
${baseUrl}/${locale}/account/grab/${grabId}

Cheers,
Opengrabs
`
    }
};

export const emailDispute = (locale, grabId, username) => {
    return {
        subject: 'Your grab has been disputed',
        content:
`
Hi ${username},

Your grab has been disputed.
You can view more here:
${baseUrl}/${locale}/account/grab/${grabId}

Cheers,
Opengrabs
`
    } 
};

export const emailBought = (locale, grabId, username) => {
    return {
        subject: 'Your grab has been bought',
        content:
`
Hi ${username},

Your grab has been bought.
You can view more here:
${baseUrl}/${locale}/account/grab/${grabId}

Cheers,
Opengrabs
`
    } 
};

export const emailDelivered = (locale, grabId, username) => {
    return {
        subject: 'Your grab has been delivered',
        content:
`
Hi ${username},

Your grab has been delivered.
You can view more here:
${baseUrl}/${locale}/account/grab/${grabId}

Cheers,
Opengrabs
`
    } 
};

export const emailReleased = (locale, grabId, username) => {
    return {
        subject: 'Your grab has been released',
        content:
`
Hi ${username},

Your grab has been released.
You can view more here:
${baseUrl}/${locale}/account/grab/${grabId}

Cheers,
Opengrabs
`
    } 
};

export const emailTicketReplyed = (locale, ticketId, username) => {
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