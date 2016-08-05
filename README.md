# jeny

_Batteries included Application deployment and development for AWS and Ansible_

## Concepts

### Deployment

A deployment is the running of 1 command with a set of environment variable where the the output will be captured and exit code represents failure or not.

This simplistic model leaves place for the use of totally different tools for different projects. You could even have an infra project that runs terraform as a deploy.

Deploys are:

- Part of a project
- In an environment
- Targeting hosts with a certain tag
- Cancelable
- Initiated by a user
- Ran one at the time for a certain project and environment
Environment

An environment belongs to a project, is often named stage, production, etc. It define variables to pass down to the deployment script and tags to target hosts.

### Project

A project is the top level entity that most other entities blong to. A user may have multiple and allows for the use of the plaform for more than one repo/app. They also define a set of variables specific to it to be used in deployments.

### Dashboards

Dashboards can be made for each projects and are the homepage for these. They are pieced together from predefined block type that can show some precomputed metric or even custom metrics comming from the metrics app (or influxdb). Multiple can be created for 1 project but the one named overview is shown as homepage.

Dashboards are:

- WYSIWYG editable
- Flexible in layout
- Can show common precomputed numbers about the app or influxdb metrics or markdown.
- Viewable in fullscreen
- Fast to work with
- Interlinkable

### Metrics

Metrics are to be stored in InfluxDB and used by Dasboards. The main purpose of the metrics app is to fill InfluxDB with deployment and hosts level related metrics using the extra metadata we have about environments, hosts and project.

The goal to always have great metrics to plot. Deploys, deploy duration, deploy users, cloudwatch metrics imported and appropriatly tagged, elb metrics imported and appropriately tagged, health check metrics.

### Health Check

Health checks are basically response code and content verification for projects external urls from multiple places in earth with:

- A simple UI to view checks and their status
- Few metrics on success state and response times being exported as metrics
- Alerts being created when a check fails
- An API for a status page to use.
Authentication

The platform having many smaller parts, a cli, a bot, mutiple apis, etc. Authentication is seen as a concern of its own an implemented by an independant app. Authentication is done using Google Auth checking againt a list of whitelisted emails or domains.

### Log store

Consulting logs for a certain part of a specific all running in a specific environment should not be hard, the should be a great UI and deeply linked urls to represent those logs to developers. This is a crucial part of debugging and trouble shooting, not needing to ssh in a box helps tremensously.

### Alerts

Alerts are the critical missing piece to a good deployment and monitoring setup. You need to be able to be notifed when some metrics pass over certain threshold and visualizing, configuring and dealing whith those alerts should be a delight as it’s the important part of devops engineers job: keeping things running.

### Experiments

Experimentation is crucial to a project doing well with users and constantly improving. Feature toggling is a simple concept with a semi complex implementation that has profound transformative effect on the way a team develops new features and releases them to user.

It allow putting cold hard numbers on each change and weigthing the value and impact of it on users. I supports decisions of XversusY and allows to slowly roll and a feature possibly backing out at any moment with the click of a button.

### Chat Bot

Having a chat bot to interact with not only very natural but a really efficient way to interect with deployment and metrics and alerts as you are alredy soending a good amount of time withing you team messaging app.

This really is and must be a first class integration and, at the forefront of our minds as the prefered way to interact with the platform.

