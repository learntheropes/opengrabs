export const emailConfirmationCode = (code) => {
    return {
        subject: 'Email confirmation code',
        content: `Your email confirmation code is ${code}`
    }
};

export const emailOrder = (locale, grabId) => {
    return {
        subject: 'New order for your travel',
        content: `A new grab has been ordered for your next travel. You can view it here: https://opengrabs.com/${locale}/${grabId}`
    }
};