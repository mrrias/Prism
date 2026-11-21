"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketQuestions = exports.STAFF_ROLE_ID = exports.ticketTypeLabels = void 0;
exports.isTicketType = isTicketType;
const seyfert_1 = require("seyfert");
exports.ticketTypeLabels = {
    apply: "Apply",
    report: "Report",
    help: "Help"
};
exports.STAFF_ROLE_ID = "1573628588349980764";
exports.ticketQuestions = {
    apply: [
        {
            id: "ticket:role",
            label: "What role are you applying for?",
            placeholder: "Enter the role name.",
            style: seyfert_1.TextInputStyle.Short,
            maxLength: 100
        },
        {
            id: "ticket:reason",
            label: "Why do you want to apply?",
            placeholder: "Explain why you want this role.",
            style: seyfert_1.TextInputStyle.Paragraph,
            maxLength: 1000
        }
    ],
    report: [
        {
            id: "ticket:reason",
            label: "What happened?",
            placeholder: "Describe what happened.",
            style: seyfert_1.TextInputStyle.Paragraph,
            maxLength: 1000
        },
        {
            id: "ticket:reported-user-id",
            label: "Discord user ID of the person being reported",
            placeholder: "Enter the user's Discord ID.",
            style: seyfert_1.TextInputStyle.Short,
            maxLength: 20
        }
    ],
    help: [
        {
            id: "ticket:reason",
            label: "What do you need help with?",
            placeholder: "Describe what you need help with.",
            style: seyfert_1.TextInputStyle.Paragraph,
            maxLength: 1000
        }
    ]
};
function isTicketType(value) {
    return Object.prototype.hasOwnProperty.call(exports.ticketTypeLabels, value);
}
