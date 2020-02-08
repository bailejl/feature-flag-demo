# feature-flag-demo

Feature flags do not just support DevOps/operations' use cases, but can support development, product management and 
other roles within an organization.  This project exists to exercise these use cases across multiple roles within an 
organization. 

This is a project to demonstrate some common and not so common feature flag use cases.  A single web page shows 20 
concurrently connected web users and how feature flag can alter each user's experience.  

**Disclaimer:** This projects is to explain the concept of feature flags and their use cases.  By no means, is this 
project designed to show how to implement feature flags, especially [Unleash](https://github.com/Unleash).  Unleash 
was used, since it was an open source feature flag system.  However, to complete some of our feature flag use cases, 
we exploit the userID and variations with Unleash.  In a production system, we would have implemented our own 
Unleash strategies.  

# Required Software to Run

- Docker 19.03.5 or higher
- Node 10.15.1 or higher

# Commands to Run

Run all the commands below from the project root folder.

1. `npm run start:feature-flags`, this starts the DB and Unleash.  This will remain running, so you will need another terminal for the other commands.
1. `npm run load-flags`, this loads the required data into the DB.
1. `npm run start:web`, starts the web app simulating 20 different users concurrently using an app.

# Demo Sequence

1. All users have the same active web experience
1. All users experience site maintenance
1. Admins and test users can access the site, while others remain in maintenance mode
1. All users have the same active web experience
1. Show a better experience, by announcing upcoming maintenance before going into maintenance mode
1. Admins and test users can access the site, while others remain in maintenance mode
1. All users have the same active web experience
1. Kill a specific user
1. All users have the same active web experience
1. Incremental rollout v2
1. All users have the same v2 active web experience
1. Some users get A and others get B UI designs
1. All users have the same v2 with A applied active web experience
1. Calendar release v3 to all users
1. All users have the same v3 with A applied active web experience
1. Some users get freemium and other get paid access
1. Turn on debug logging for one user having troubles


# Possible Use Cases

Feature flags have mature and have merged with other capabilities like remote configuration and user analytics.  Combined 
together, feature flags today can support several different use cases across several functional roles.  These functional 
roles include, project management, DevOps/Operations, development, technical support and much more.  Here is a further
breakdown of these roles into the use cases.  

## DevOps/Operations

* Maintenance mode (X)
  * Does not allow the user to user the app while in this mode
* Banner notification (X)
  * User gets a notify of crucial info in a very obvious and visible manner, so they do not miss it
* Kill switch
  * Target specific users and remove their ability to use the application
* Incremental roll outs/canary launch
  * Slowly roll out a release to a small number to ensure smooth running before expanding to the whole user base 

## Product Management

* Block/allow users
  * Block and allow users based on any relevant factor like, location, type of credit card used or anything the business deems correct
* Early access/beta access
  * Allow access to people who are early access/beta users
* A/B testing
  * Randomly provide different experiences from UI design to user flows in the app, so you can find what works best for your app
* Calendar driven launches
  * With feature flags, **deployment** does **not** equal **release**.  This allows the product team to deploy at a specific date an time for that new relase!

## Development

* Subscriptions
  * Instead of building out a subscription system in your app, use feature flags 
* Newbie vs. power user
  * Restrict power in the app to people who have been trained to use it
* Single trunk branching
  * Features flags work great with single trunk branching, which allows for short lived branches and incomplete work to go to production  
* Test in production
  * "Does it work in production?" is a bad question to ask, so go test it before you release it using feature flags  

## Support

* User targeted debug/verbose logging
  * Wouldn't it be great to get detailed logs about a user's problem without having to turn debug logging on for everyone?  Well, now your support staff can do it to help troubleshoot user issues sooner.  

