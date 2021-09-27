const form = document.getElementById('contact-form');
let name = document.getElementById('name');
let phone = document.getElementById('Phone');
let email = document.getElementById('email');
let query = document.getElementById('query');
let button = document.getElementById('query-button');
form.addEventListener('submit',(e)=>{
	e.preventDefault();
	button.disabled = true;
	button.textContent = "Sending";
	let formData = {
		name: name.value,
		phone: phone.value,
		email: from.value,
		query: query.value
	}

	let xhr = new XMLHttpRequest();
	xhr.open('POST', '/tenovaters');
	xhr.setRequestHeader('content-type','application/json');
	xhr.onload = function(){
		console.log(xhr.responseText);
		if(xhr.responseText == 'success'){
			alert('email-sent');
			name.value = '';
			phone.value = '';
			email.value = '';
			query.value = '';
		}
		else{
			alert('something went wrong');
		}
	}

	xhr.send(JSON.stringify(formData));
	button.disabled = false;
});