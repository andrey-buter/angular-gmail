'use strict';

var app = angular.module('gmailApp', ['ui.router']);

app.config(function ($stateProvider) {
	$stateProvider.state('home', {
		url: '/',
		template: '<inbox></inbox>'
	}).state('spam', {
		url: '/spam',
		template: '<spam></spam>'
	});
});
app.service('dbJsRuService', function ($http) {
	var URL = 'http://test-api.javascript.ru/v1/andrey-buter-1';

	this.getAll = function (model) {
		return $http.get(URL + '/' + model).then(function (response) {
			return response.data;
		});
	};

	this.add = function (model, data) {
		return $http.post(URL + '/' + model, data).then(function (response) {
			return response.data;
		});
	};

	this.update = function (model, id, data) {
		return $http.patch(URL + '/' + model + '/' + id, data).then(function (response) {
			return response.data;
		});
	};

	this.delete = function (model, id) {
		return $http.delete(URL + '/' + model + '/' + id);
	};

	this.deleteAll = function (model) {
		return $http.delete(URL + '/' + model);
	};
}).service('dbLocalService', function () {
	var _this = this;

	this.getAll = function (model) {
		return new Promise(function (resolve) {
			var data = window.localStorage.getItem(model);

			data = !data ? [] : JSON.parse(data);

			setTimeout(function () {
				resolve(data);
			}, 0);
		});
	};

	this.add = function (model, data) {
		return _this.getAll(model).then(function (saved) {
			var item = angular.extend({}, data);

			item._id = ++saved.length;

			saved = saved.slice(0, -1);

			if (0 == saved.length) saved = [item];else saved.push(item);

			window.localStorage.setItem(model, JSON.stringify(saved));

			return item;
		});
	};

	this.update = function (model, id, data) {
		return _this.getAll(model).then(function (saved) {
			angular.forEach(saved, function (item, key) {
				if (id != item._id) return;

				saved[key] = data;

				window.localStorage.setItem(model, JSON.stringify(saved));

				return data;
			});
		});
	};

	this.delete = function (model, id) {
		return _this.getAll(model).then(function (saved) {
			var i = void 0;

			angular.forEach(saved, function (item, key) {
				if (id != item._id) return;

				i = key;
			});

			// delete saved[ saved ]
		});
	};

	this.deleteAll = function (model) {
		return new Promise(function (resolve) {
			window.localStorage.removeItem(model);

			setTimeout(function () {
				resolve('');
			}, 0);
		});
	};
}).service('dbService', function (dbJsRuService, dbLocalService) {
	var _this2 = this;

	var serverType = 'local';

	this.local = dbLocalService;
	this.jsru = dbJsRuService;

	this.getAll = function (model) {
		return _this2[serverType].getAll(model);
	};
	this.add = function (model, data) {
		return _this2[serverType].add(model, data);
	};
	this.update = function (model, id, data) {
		return _this2[serverType].update(model, id, data);
	};
	this.delete = function (model, id) {
		return _this2[serverType].delete(model, id);
	};

	this.deleteAll = function (model) {
		return _this2[serverType].deleteAll(model);
	};
});

app.service('mailBoxService', function (dbService) {
	var MODEL = 'mailboxes';
	var TITLE = 'gmail';

	var id = false;

	// dbService.deleteAll( MODEL );

	this.getId = function () {
		return id;
	};

	this.init = function () {
		return dbService.getAll(MODEL).then(function (data) {
			// console.log('mailBox getAll')
			// console.log(data)
			if (0 < data.length) return data;

			// создаем новый mailbox
			return dbService.add(MODEL, { title: TITLE });
		}).then(function (data) {
			if (angular.isArray(data)) id = data[0]._id;else id = data._id;

			return id;
		});
	};
}).service('letterService', function ($filter, dbService, mailBoxService) {
	var _this3 = this;

	var MODEL = 'letters';

	// dbService.deleteAll( MODEL );

	this.getAll = function () {
		return dbService.getAll(MODEL).then(_this3.lettersFromJson);
	};

	this.add = function (letter) {
		letter.body.date = _this3.getCurrentTime();
		letter.body.unread = true;
		letter.body.draft = false;
		letter.mailbox = mailBoxService.getId();

		return dbService.add(MODEL, _this3.prepareToSave(letter)).then(function (data) {
			return _this3.lettersFromJson([data])[0];
		});
	};

	this.update = function (letter) {
		return dbService.update(MODEL, letter._id, _this3.prepareToSave(letter)).then(function (data) {
			return _this3.lettersFromJson([data])[0];
		});
	};

	this.delete = function (letter) {
		return dbService.delete(MODEL, letter._id).then(function (data) {
			// console.log(data)
			return data;
		});
	};

	this.prepareToSave = function (letter) {
		var out = angular.extend({}, letter);

		out.body = $filter('json')(out.body);

		return out;
	};

	this.lettersFromJson = function (letters) {
		letters = angular.forEach(letters, function (val) {
			val.body = angular.fromJson(val.body);

			return val;
		});

		return letters;
	};

	this.defautNewLetter = function () {
		var self = _this3;

		return {
			to: 'test@test.com',
			subject: 'subject - ' + self.getCurrentTime(),
			body: {
				text: 'Test text'
			}
		};
	};

	this.getCurrentTime = function () {
		return $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
	};

	// this.filterBy = ( arr, prop = {} ) => {
	// 	return $filter('filter')( arr, prop );
	// }
}).service('factoryService', function (dbService, mailBoxService, letterService) {
	this.db = dbService;
	this.mailBox = mailBoxService;
	this.letter = letterService;
});

app
// .component( 'newMessage', {
// 	bindings: {
// 		writeNew: '=', // двустороннее связыаение, чтоб в gmail.writeNew также менялось состояние
// 		letters: '=',
// 	},
// 	templateUrl: 'tmpl/new-message.html',
// 	controller: function( factoryService ) {
// 		this.writeNew = false;
// 		this.newLetter = factoryService.letter.defautNewLetter();

// 		this.submit = () => {
// 			factoryService.letter
// 				.add( this.newLetter )
// 				.then( (data) => {
// 					this.letters.push( data );
// 					this.newLetter = {};
// 					this.writeNew = false;
// 					console.log('email success added')
// 				});
// 		}
// 	}
// })
.component('letter', {
	bindings: {
		letter: '<'
	},
	templateUrl: 'tmpl/letter.html',
	controller: function controller(factoryService) {
		var _this4 = this;

		console.log(this.letter);
		this.open = function () {
			_this4.openSingle();

			if (false === _this4.letter.body.unread) return;

			_this4.letter.body.unread = false;

			factoryService.letter.update(_this4.letter).then(function (data) {
				console.log('success updated');
				console.log(data);
			});
		};
		this.delete = function () {
			_this4.deleteLetter();

			factoryService.letter.delete(_this4.letter).then(function (data) {
				console.log('success removed');
			});
		};
		this.draft = function () {
			if (true === _this4.letter.body.draft) return;

			_this4.letter.body.draft = true;

			factoryService.letter.update(_this4.letter).then(function (data) {
				console.log('success updated');
				console.log(data);
			});
		};
	}
}).component('singleLetter', {
	bindings: {
		letter: '<'
	},
	templateUrl: 'tmpl/opened-letter.html'
}).component('gmail', {
	templateUrl: 'tmpl/gmail.html',
	controller: function controller(factoryService, $filter) {
		this.writeNew = false;
		this.status = 'list';
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
		// 
		// <inbox ng-if="'list' == $ctrl.status"></inbox>
	}
});
app.component('inbox', {
	bindings: {},
	templateUrl: 'tmpl/letters.html',
	controller: function controller(factoryService, $filter) {
		var _this5 = this;

		this.letters = [];

		console.log(123);

		factoryService.letter.getAll().then(function (data) {
			_this5.letters = data;
			console.log(_this5.letters);
		});

		this.deleteLetter = function (letter) {
			_this5.letters.splice(_this5.letters.indexOf(letter), 1);
		};

		this.getUnreadLettersCount = function () {
			var count = $filter('filter')(_this5.letters, { body: { unread: true } }).length;

			if (0 == count) return '';

			return '(' + count + ')';
		};
	}
});

app.component('spam', {
	templateUrl: 'tmpl/spam.html'
});
//# sourceMappingURL=common.js.map
