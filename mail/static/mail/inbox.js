document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

//This function shows the email composition view and hides the other view.
//The function takes two optional arguments - reply and id. 
//If reply has a value of 'true', the user is replying to an email, and so certain fields are pre-filled. 'id' is then the id of the email they're replying to.
function compose_email(reply, id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (reply === true)
  {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#compose-recipients').value  = email.sender;
      document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n ${email.body}`;
    })
  }

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
  load_mailbox('sent');
}

//This function shows the mailbox view, hides other views and fetches the emails via an API request
//It then calls the 'add_email' function on each of the fetched emails. That function then adds the emails to the DOM, into the emails-view div.
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 id="mailboxname">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><div id="messages"></div>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function (emails) {
      if (mailbox === 'archive')
      {
        if (emails.archived === true)
        {
          add_email(emails, mailbox)
        }
      }
      else
      {
        add_email(emails, mailbox)
      }
    });
  })
}

//Show view of a single email, when it is clicked in a mailbox
function show_email(id, mailbox) {

  //Clear the 'emailmeta' div, in case a previous email has been loaded
  document.querySelector('#emailmeta').innerHTML = '';
  //Clear the 'buttons' div, so that buttons from previously loaded emails don't show up
  document.querySelector('#buttons').innerHTML = '';
  
  //show the single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';

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

  if (mailbox === 'inbox')
  {
    const replybtn = document.createElement('button');
    replybtn.id = 'replybtn';
    replybtn.className = 'btn btn-primary';
    replybtn.innerHTML = 'Reply';
    replybtn.onclick = function() {compose_email(true, id)};
    document.querySelector('#buttons').append(replybtn);

    const archivebtn = document.createElement('button');
    archivebtn.id = 'archivebtn';
    archivebtn.className = 'btn btn-primary';
    archivebtn.innerHTML = 'Archive';
    archivebtn.onclick = function() {archive_email(id)};
    document.querySelector('#buttons').append(archivebtn);

    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }
  else if (mailbox === 'archive')
  {
    const unarchivebtn = document.createElement('button');
    unarchivebtn.id = 'unarchivebtn';
    unarchivebtn.className = 'btn btn-primary';
    unarchivebtn.innerHTML = 'Unarchive';
    unarchivebtn.onclick = function() {unarchive_email(id)};
    document.querySelector('#buttons').append(unarchivebtn);
  }

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

//This gets called on each email 
function add_email(contents, mailbox) {
  
  //create div that contains the email message. Give it a class of row, which will contain the various columns
  const emailmsg = document.createElement('div');
  emailmsg.className = 'emailmsg row';
  emailmsg.id = `msg${contents.id}`;
  document.querySelector('#messages').append(emailmsg);
  emailmsg.onclick = function() {show_email(contents.id, mailbox)};
  
  //some logic about what properties of the email to display, depending on the mailbox the user is viewing
  //for example, you do not want the email receiver to appear in your inbox - since it is obviously you. Vice versa for 'sent' mailbox. 
  if (mailbox === 'inbox' || mailbox === 'archive') 
  {
    const msgsender = document.createElement('div');
    msgsender.className = 'msgsender col-3';
    msgsender.innerHTML = contents.sender;
    document.querySelector(`#msg${contents.id}`).append(msgsender);
  }
  else if (mailbox === 'sent')
  {
    const msgreceiver = document.createElement('div');
    msgreceiver.className = 'msgreceiver col-3';
    msgreceiver.innerHTML = contents.recipients;
    document.querySelector(`#msg${contents.id}`).append(msgreceiver);
  }

  if (contents.read === false)
  {
    emailmsg.style.backgroundColor = 'white';
  }
  else if (contents.read === true)
  {
    emailmsg.style.backgroundColor = 'WhiteSmoke';
  }
  
  const msgsubject = document.createElement('div');
  msgsubject.className = 'msgsubject col-6';
  msgsubject.innerHTML = contents.subject;
  document.querySelector(`#msg${contents.id}`).append(msgsubject);

  const msgtime = document.createElement('div');
  msgtime.className = 'msgtime col-3';
  msgtime.innerHTML = contents.timestamp;
  document.querySelector(`#msg${contents.id}`).append(msgtime); 
}

function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })

  load_mailbox('inbox');
}

function unarchive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })

  load_mailbox('inbox');
}