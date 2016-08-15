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