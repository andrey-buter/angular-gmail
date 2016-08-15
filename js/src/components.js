app
	.component( 'newMessage', {
		bindings: {
			writeNew: '=', // двустороннее связыаение, чтоб в gmail.writeNew также менялось состояние
			letters: '=',
		},
		templateUrl: 'tmpl/new-message.html',
		controller: function( factoryService ) {
			this.writeNew = false;
			this.newLetter = factoryService.letter.defautNewLetter();

			this.submit = () => {
				factoryService.letter
					.add( this.newLetter )
					.then( (data) => {
						this.letters.push( data );
						this.newLetter = {};
						this.writeNew = false;
						console.log('email success added')
					});
			}
		}
	})
	.component( 'letter', {
		bindings: {
			letter: '<',
		 // 	openSingle: '&',
		 // 	deleteLetter: '&'
		},
		templateUrl: 'tmpl/letter.html',
		controller: function( factoryService ) {
			console.log(this.letter)
			this.open = () => {
				this.openSingle();

				if ( false === this.letter.body.unread ) 
					return;

				this.letter.body.unread = false;

				factoryService.letter
					.update( this.letter )
					.then( (data) => {
						console.log('success updated')
						console.log(data)
					});
			}
			this.delete = () => {
				this.deleteLetter();

				factoryService.letter
					.delete( this.letter )
					.then( (data) => {
						console.log('success removed')
					});
			}
			this.draft = () => {
				if ( true === this.letter.body.draft ) 
					return;

				this.letter.body.draft = true;

				factoryService.letter
					.update( this.letter )
					.then( (data) => {
						console.log('success updated')
						console.log(data)
					});
			}
		}
	})
	.component( 'singleLetter', {
		bindings: {
			letter: '<',
		},
		templateUrl: 'tmpl/opened-letter.html',
	})
	.component( 'gmail', {
		templateUrl: 'tmpl/gmail.html',
		controller: function( factoryService, $filter ) {
			this.writeNew    = false;
			this.status      = 'list';
			// this.letters     = [];
			this.openedLetter = {};

			factoryService.mailBox.init();

			// factoryService.letter.getAll()
			// 	.then( (data) => {
			// 		this.letters = data;
			// 	});

			// this.openLetter = (letter) => {
			// 	this.status       = 'single';
			// 	this.openedLetter = letter;
			// }
			// this.closeLetter = () => {
			// 	this.status       = 'list';
			// 	this.openedLetter = {};
			// }
			// this.deleteLetter = (letter) => {
			// 	this.letters.splice(this.letters.indexOf(letter), 1);
			// }
			// this.getUnreadLettersCount = () => {
			// 	let count = $filter('filter')( this.letters, { body: { unread: true } } ).length;

			// 	if ( 0 == count )
			// 		return '';

			// 	return `(${count})`;
			// }
		}
	})