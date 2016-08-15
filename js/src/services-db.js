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
