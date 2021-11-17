// send email by nodemailer
const sgMail = require("@sendgrid/mail");

exports.sendEmail = (email, templateId, username, token) => {
  const apiKey =
    "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";
  sgMail.setApiKey(apiKey);

  const msg = {
    to: email,
    from: { name: "Drug Loft Xpress", email: "nishankadel39@gmail.com" },
    templateId: templateId,
    dynamic_template_data: {
      token: token,
      name: username,
    },
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent successfully to " + msg.to);
    })
    .catch((error) => {
      console.error(error);
    });
};
