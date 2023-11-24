
/api/notes	GET	 Hämta anteckningar

/api/notes	POST	 Spara en anteckning

/api/notes	PUT	 Ändra en anteckning

/api/notes	DELETE	 Ta bort en anteckning

/api/user/signup	POST	Skapa konto

/api/user/login	POST	Logga in

Note - objekt


Nyckel	Värde	Beskrivning

id	String	Ett genererat ID för denna anteckning.

title	String	Titeln på anteckningen. Max 50 tecken.

text	String	Själva anteckningstexten, max 300 tecken.

createdAt	Date	När anteckningen skapades.

modifiedAt	Date	När anteckningen sist modifierades.

