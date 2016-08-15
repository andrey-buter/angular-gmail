app
	.component( 'inbox', {
		bindings: {},
		templateUrl: 'tmpl/letters.html',
		controller: function( factoryService, $filter ) {
			this.letters = [];

			console.log(123)

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