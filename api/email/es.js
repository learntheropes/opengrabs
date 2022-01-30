export const emailConfirmationCode = (code) => {
    return {
        subject: 'Codigo de confirmation de correo electronico',
        content: `Tu codigo de confirmation es ${code}`
    }
};