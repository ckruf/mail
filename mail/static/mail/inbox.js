document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //Call the 'send_email' function when the submit button is clicked
  document.querySelector('#send').addEventListener('click', send_email);
}

function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: `${document.querySelector('#compose-recipients').value}`,
      subject: `${document.querySelector('#compose-subject').value}`,
      body: `${document.querySelector('#compose-body').value}`
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
  load_mailbox(sent);
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 id="mailboxname">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function (emails) {
      add_email(emails, mailbox)
    });
  })
}

function show_email(id) {
  //show the single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';

  // create a div containing the sender, receiver, subject and time
  const emailmeta = document.createElement('div');
  emailmeta.id = 'emailmeta';
  document.querySelector('#single-email-view').append(emailmeta);

  const separator = document.createElement('hr');
  document.querySelector('#single-email-view').append(separator);


  const msgsender = document.createElement('div');
  msgsender.id = 'msgsender';
  
  const msgreceiver = document.createElement('div');
  msgreceiver.id = 'msgreceiver';
  
  const msgsubject = document.createElement('div');
  msgsubject.id = 'msgsubject'
  
  const msgtime = document.createElement('div');
  msgtime.id = 'msgtime';

  emailmeta.append(msgsender);
  emailmeta.append(msgreceiver);
  emailmeta.append(msgsubject);
  emailmeta.append(msgtime);

  // create a div containing the body of the message
  const emailbody = document.createElement('div');
  emailbody.id = 'emailbody';
  document.querySelector('#single-email-view').append(emailbody);

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    msgsender.innerHTML = `<b>From:</b> ${email.sender}`;
    msgreceiver.innerHTML = `<b>To:</b> ${email.recipients}`;
    msgsubject.innerHTML = `<b>Subject:</b> ${email.subject}`;
    msgtime.innerHTML = `<b>Timestamp:</b> ${email.timestamp}`;
    emailbody.innerHTML = email.body;
  })

  

}

function add_email(contents, mailbox) {
  
  //create div that contains the emails message. Give it a class of row, which will contain the various columns
  const emailmsg = document.createElement('div');
  emailmsg.className = 'emailmsg row';
  emailmsg.id = `msg${contents.id}`;
  document.querySelector('#emails-view').append(emailmsg);
  emailmsg.onclick = function() {show_email(contents.id)};
  
  //some logic about what properties of the email to display, depending on the mailbox the user is viewing
  //for example, you do not want the email receiver to appear in your inbox - since it is obviously you. Vice versa for 'sent' mailbox. 
  if (mailbox === 'inbox') 
  {
    const msgsender = document.createElement('div');
    msgsender.className = 'msgsender col';
    msgsender.innerHTML = contents.sender;
    document.querySelector(`#msg${contents.id}`).append(msgsender);
  }
  else if (mailbox === 'sent')
  {
    const msgreceiver = document.createElement('div');
    msgreceiver.className = 'msgreceiver col';
    msgreceiver.innerHTML = contents.recipients;
    document.querySelector(`#msg${contents.id}`).append(msgreceiver);
  }
  else if (mailbox === 'archived')
  {
    //to do
  }
  
  const msgsubject = document.createElement('div');
  msgsubject.className = 'msgsubject col';
  msgsubject.innerHTML = contents.subject;
  document.querySelector(`#msg${contents.id}`).append(msgsubject);

  const msgtime = document.createElement('div');
  msgtime.className = 'msgtime col';
  msgtime.innerHTML = contents.timestamp;
  document.querySelector(`#msg${contents.id}`).append(msgtime); 
}