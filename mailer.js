/**
 * Created by Suyash on 17/02/18.
 */

const AWS = require('aws-sdk');
const SES = new AWS.SES({
    accessKeyId: process.env.ACCESS_KEY_SES,
    secretAccessKey: process.env.SECRET_KEY_SES,
    region: "us-west-2",
    endpoint: new AWS.Endpoint('https://email.us-west-2.amazonaws.com')
});

// to_mail => receiver's mail address (e.g. oz@gmail.com )
// from_mail => sender's mail initials (e.g. admin, events, guest etc.)
// subject => Email Subject
// body => body of mail (supports html formatting)
// sender_name => Name of sender to display (e.g. Admin Tryst IITD)
function sendMail(to_mail, from_mail, subject, body, sender_name = "Status Board") {
    const params = {
        Destination: {
            ToAddresses: [to_mail]
        },
        Message: {
            Body: {
                Html: {
                    Data: body
                },
            },
            Subject: {
                Data: subject
            }
        },
        Source: sender_name + "\<" + from_mail + "@devclub.in\>",
    };
    SES.sendEmail(params, function (err, data) {
        if (err) {
            console.log("SES err: ", err);
        } else {
            console.log("Mail sent to: " + to_mail + " with subject: " + subject);
        }
    });
}

module.exports = {
    sendMail: sendMail,
};
