export const emailConfirmationCode = (code) => {
    return {
        subject: 'Email confirmation code',
        content: `Your email confirmation code is ${code}`
    }
};