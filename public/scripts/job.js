const form = document.getElementById('contact-form');
let job = document.getElementById('job');
let name = document.getElementById('name');
let phone = document.getElementById('Phone');
let email = document.getElementById('email');
let button = document.getElementById('query-button');
form.addEventListener('submit',(e)=>{
	e.preventDefault();
	button.disabled = true;
	button.textContent = "Sending";
	let formData = {
		job:job.value,
		name: name.value,
		phone: phone.value,
		email: from.value,
	}

	let xhr = new XMLHttpRequest();
	xhr.open('POST', '/tenovaters/features/:id');
	xhr.setRequestHeader('content-type','application/json');
	xhr.onload = function(){
		console.log(xhr.responseText);
		if(xhr.responseText == 'success'){
			alert('email-sent');
			job.value = '';
			name.value = '';
			phone.value = '';
			email.value = '';
		}
		else{
			alert('something went wrong');
		}
		button.textContent = "Send";
	}

	xhr.send(JSON.stringify(formData));
	button.disabled = false;
});