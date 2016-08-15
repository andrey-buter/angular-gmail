app.config( ($stateProvider) => {
	$stateProvider
		.state('home', {
			url: '/',
			template: '<inbox></inbox>',
		})
		.state('spam', {
			url: '/spam',
			template: '<spam></spam>'
		});

} )