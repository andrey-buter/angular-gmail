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
