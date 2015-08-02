if(Meteor.isClient) {
  Meta.config({
      options: {
        // Meteor.settings[Meteor.settings.environment].public.meta.title
        title: 'emurphy.com',
        suffix: 'Market Valueation Dashboard'
      }
  });
}
