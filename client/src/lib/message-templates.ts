interface TemplateOptions {
  friendName: string;
  jobTitle: string;
  jobUrl: string;
  targetCompany: string;
  employeeName: string;
  userName: string;
  userLinkedInUrl: string;
  calendarUrl: string;
}

export const getStrongConnectionTemplate = (options: TemplateOptions): string => {
  return `Hey ${options.friendName},

Hope you're doing well! Quick ask — I'm applying for a ${options.jobTitle} role at ${options.targetCompany} and noticed you're connected to ${options.employeeName} there. 

If you know them well enough, would you mind forwarding a quick note on my behalf? Here's something you could easily pass along if it's helpful:

---
Hi ${options.employeeName},

Hope you're doing well! A friend of mine, ${options.userName} (${options.userLinkedInUrl}), is exploring opportunities and mentioned they're excited about the ${options.jobTitle} role at ${options.targetCompany}. Based on what I know about them, they'd be a great fit. Just wanted to put them on your radar! Would you be open to connecting? If so, let me know or they provided their calendar link ${options.calendarUrl} for ease. 
---

No pressure at all — just figured I'd ask. Thanks a ton either way!

${options.userName}`;
}

export const getMediumConnectionTemplate = (options: TemplateOptions): string => {
  return `Hi ${options.friendName},

I hope this message finds you well! I noticed we're both connected with ${options.employeeName} from ${options.targetCompany}, and I wanted to reach out for a small favor.

I'm currently applying for the ${options.jobTitle} position at ${options.targetCompany} and I'm really excited about the opportunity. Would you possibly feel comfortable introducing me to ${options.employeeName}? I'd really appreciate a brief introduction if you think it wouldn't be imposing.

I've drafted a short message below that you could use or modify:

---
Hi ${options.employeeName},

I wanted to connect you with ${options.userName} (${options.userLinkedInUrl}) who I know professionally. They're interested in the ${options.jobTitle} role at ${options.targetCompany} and I thought you two should connect. They have relevant experience and would appreciate a conversation if you have time - they're available at ${options.calendarUrl}.
---

I completely understand if you're not comfortable with this request. Either way, thanks for considering it!

Best regards,
${options.userName}`;
}

export const getWeakConnectionTemplate = (options: TemplateOptions): string => {
  return `Hello ${options.friendName},

I hope you don't mind me reaching out. I see that we're both connected to ${options.employeeName} at ${options.targetCompany}.

I'm currently exploring new opportunities and am particularly interested in the ${options.jobTitle} position at ${options.targetCompany}. I was wondering if you might know ${options.employeeName} well enough to facilitate an introduction?

If you're comfortable doing so, here's a brief message you could use:

---
Hello ${options.employeeName},

I'd like to introduce you to ${options.userName} (${options.userLinkedInUrl}), who I'm connected with on LinkedIn. They're interested in the ${options.jobTitle} position at ${options.targetCompany} and would appreciate a brief conversation to learn more. They can be reached through their calendar link: ${options.calendarUrl}
---

I fully understand if you're not in a position to make this introduction. Thank you for considering my request.

Regards,
${options.userName}`;
}

export const getTemplateByStrength = (strength: number, options: TemplateOptions): string => {
  if (strength >= 4) {
    return getStrongConnectionTemplate(options);
  } else if (strength >= 3) {
    return getMediumConnectionTemplate(options);
  } else {
    return getWeakConnectionTemplate(options);
  }
}