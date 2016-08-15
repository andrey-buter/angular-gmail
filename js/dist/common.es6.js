const app = angular.module( 'gmailApp', ['ui.router'] );
	
app.config( ($stateProvider) => {
	$stateProvider.state('home', {
		url: '/',
		template: '<inbox></inbox>',
		// path: '/000_angular/gmail'
	});

	$stateProvider.state('spam', {
		url: '/spam',
		template: '<spam></spam>'
	});
} )
app
	.service( 'dbJsRuService', function( $http ) {
		const URL = 'http://test-api.javascript.ru/v1/andrey-buter-1';

		this.getAll = ( model ) => $http.get( `${URL}/${model}` ).then( response => response.data ); 

		this.add = ( model, data ) => $http.post( `${URL}/${model}`, data ).then( response => response.data );

		this.update = ( model, id, data ) => $http.patch( `${URL}/${model}/${id}`, data ).then( (response) => {
			return response.data;
		} );

		this.delete = ( model, id ) => $http.delete( `${URL}/${model}/${id}` );

		this.deleteAll = ( model ) => $http.delete( `${URL}/${model}` );
	})
	.service( 'dbLocalService', function() {
		this.getAll = ( model ) => new Promise( (resolve) => {
			let data = window.localStorage.getItem( model );

			data = !data ? [] : JSON.parse( data );

			setTimeout( () => {
				resolve( data );
			}, 0);
		});

		this.add = ( model, data ) => this.getAll( model ).then( (saved) => {
			let item = angular.extend({},data);

			item._id = ++saved.length;

			saved = saved.slice( 0, -1 );

			if ( 0 == saved.length )
				saved = [ item ];
			else
				saved.push( item );

			window.localStorage.setItem( model, JSON.stringify( saved ) );

			return item;
		});

		this.update = ( model, id, data ) => this.getAll( model ).then( (saved) => {
			angular.forEach( saved, (item, key) => {
				if ( id != item._id ) 
					return;

				saved[ key ] = data;

				window.localStorage.setItem( model, JSON.stringify( saved ) );

				return data;
			})
		});

		this.delete = ( model, id ) => this.getAll( model ).then( (saved) => {
			let i;

			angular.forEach( saved, ( item, key ) => {
				if ( id != item._id ) 
					return;

				i = key;				
			});

			// delete saved[ saved ]
		})

		this.deleteAll = ( model ) => new Promise( ( resolve ) => {
			window.localStorage.removeItem( model );

			setTimeout( () => {
				resolve( '' );
			}, 0);
		});
	})
	.service( 'dbService', function( dbJsRuService, dbLocalService ) {
		const serverType = 'local';

		this.local = dbLocalService;
		this.jsru  = dbJsRuService;


		this.getAll = ( model ) => {
			return this[ serverType ].getAll( model );
		}
		this.add = ( model, data ) => {
			return this[ serverType ].add( model, data );
		}
		this.update = ( model, id, data ) => {
			return this[ serverType ].update( model, id, data );
		}
		this.delete = ( model, id ) => {
			return this[ serverType ].delete( model, id );
		}

		this.deleteAll = ( model ) => {
			return this[ serverType ].deleteAll( model );
		}
	})

app
	.service( 'mailBoxService', function( dbService ) {
		const MODEL = 'mailboxes';
		const TITLE = 'gmail';

		let id = false;

		// dbService.deleteAll( MODEL );
		
		this.getId = () => id;

		this.init = () => {
			return dbService.getAll( MODEL )
				.then( ( data ) => {
					// console.log('mailBox getAll')
					// console.log(data)
					if ( 0 < data.length ) 
						return data;

					// создаем новый mailbox
					return dbService.add( MODEL, { title: TITLE } );
				})
				.then( ( data ) => {
					if ( angular.isArray( data ) )
						id = data[0]._id;
					else
						id = data._id;

					return id;
				});
		}
	})
	.service( 'letterService', function( $filter, dbService, mailBoxService ) {
		const MODEL = 'letters';

		// dbService.deleteAll( MODEL );

		this.getAll = () => {
			return dbService
					.getAll( MODEL )
					.then( this.lettersFromJson );
		}

		this.add = ( letter ) => {
			letter.body.date   = this.getCurrentTime();
			letter.body.unread = true;
			letter.body.draft  = false;
			letter.mailbox     = mailBoxService.getId();

			return dbService
					.add( MODEL, this.prepareToSave( letter ) )
					.then( (data) => {
						return this.lettersFromJson( [ data ] )[0];
					});
		}

		this.update = ( letter ) => {
			return dbService
					.update( MODEL, letter._id, this.prepareToSave( letter ) )
					.then( (data) => {
						return this.lettersFromJson( [ data ] )[0];
					});
		}

		this.delete = ( letter ) => {
			return dbService
					.delete( MODEL, letter._id )
					.then( (data) => {
						// console.log(data)
						return data;
					});
		}

		this.prepareToSave = ( letter ) => {
			let out = angular.extend({}, letter);

			out.body = $filter('json')( out.body );

			return out;
		}

		this.lettersFromJson = ( letters ) => {
			letters = angular.forEach( letters, function( val ) {
				val.body = angular.fromJson( val.body );

				return val;
			});

			return letters;
		}

		this.defautNewLetter = () => {
			let self = this;

			return {
				to: 'test@test.com',
				subject: 'subject - ' + self.getCurrentTime(),
				body: {
					text: 'Test text'
				}
			}
		};

		this.getCurrentTime = () => {
			return $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
		}

		// this.filterBy = ( arr, prop = {} ) => {
		// 	return $filter('filter')( arr, prop );
		// }
	})
	.service( 'factoryService', function( dbService, mailBoxService, letterService ) {
		this.db      = dbService;
		this.mailBox = mailBoxService;
		this.letter  = letterService;
	})

app
	.component( 'inbox', {
		templateUrl: 'tmpl/letters.html',
		controller: function( factoryService, $filter ) {
			this.letters = [];

			factoryService.letter.getAll()
				.then( (data) => {
					this.letters = data;
					console.log(this.letters)
				});

			this.deleteLetter = (letter) => {
				this.letters.splice(this.letters.indexOf(letter), 1);
			}
			
			this.getUnreadLettersCount = () => {
				let count = $filter('filter')( this.letters, { body: { unread: true } } ).length;

				if ( 0 == count )
					return '';

				return `(${count})`;
			}
		}
	})
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

