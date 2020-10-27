# awesomeproject2

This is an example data visualization project of a flask api backend with a mongo database. 

Leaflet and Plotly are used for the visualizations. Bootstrap is used for design and structure. 

A mapbox access token is required to run the app locally. You can add a `config.js` file to the `static/js` folder, and store the access token in a variable called `MapboxToken`. 

## Heroku Deployment Instructions

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).   
    * create a cluster in the Shared Clusters tier.
    * create a database user and make note of the credentials.
    * whitelist a connect from anywhere IP address (0.0.0.0/0).
    * visit the connect your application screen, choose python, and copy your MONGO_URI connection string

2. Create a free [Heroku account](https://signup.heroku.com/).
    * from the dashboard create a new app (the app name must be unique among all the apps currently on heroku, so get creative).
    * under settings, click reveal config vars.
    * edit your MONGO_URI connection string to include your database user password and the name of the database you've configured in your flask app.
    * save this string as a value for the key MONGO_URI
    * copy your mapbox token from your config.js file and add it as the value to a key called MAPBOX

3. Edit your codebase for deployment.
    * enable your python environment.
    * checkout a new branch.
    * install `gunicorn` and `pymongo[srv]`, and export your requirements.txt file.
    * add a file to the root of your repo called `Procfile` and add this line of code `web: gunicorn app:app` (note the `app:app` part will depend on what you've named your app file and your app in your code).
    * in `app.py`: 
        - add `import os` to the [imports section at the top](https://github.com/blackdotbug/awesomeproject2/blob/6bf4a1285bfc0f3fbb9aff755d5f007e4b47ff1a/app.py#L1), 
        - [change the value](https://github.com/blackdotbug/awesomeproject2/blob/6bf4a1285bfc0f3fbb9aff755d5f007e4b47ff1a/app.py#L12) of `app.config["MONGO-URI"]` to `os.environ['MONGO_URI']`, and 
        - [in the render_template function](https://github.com/blackdotbug/awesomeproject2/blob/6bf4a1285bfc0f3fbb9aff755d5f007e4b47ff1a/app.py#L20) for your index route pass `os.environ['MAPBOX']` as a variable called `mapbox`.
    * in your index.html template remove the script tag to config.js and [define a global javascript variable](https://github.com/blackdotbug/awesomeproject2/blob/6bf4a1285bfc0f3fbb9aff755d5f007e4b47ff1a/templates/index.html#L100-L102) using the mapbox variable you've passed to the template from your flask route.
    * add, commit and push your new branch to github.

4. Deploy your app
    * visit the deploy tab of your heroku app and select github as the deployment method.
    * connect the github repository you are going to deploy.
    * under manual deploy select the deploy branch from the repo and click the deploy branch button.
    * visit your app URL, and once everything is working remove `debug=True` from the `app.run()` command [at the bottom of app.py](https://github.com/blackdotbug/awesomeproject2/blob/010866ab8cd9da6c4d2da898358c00d2d32cff3a/app.py#L38), add-commit-push the change to your deploy branch, and manually redeploy the app.

### Troubleshooting

If you get an application error when you try to visit your newly deployed site you'll need some heroku troubleshooting tools.

* from the app's page in heroku, you can view recent logs under the More button. 
* you can also install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) which gives you lots of command line tools for creating and deploying apps, and troubleshooting and reviewing log files. 
* There's also a handful of useful things in the Heroku Dev Center under [Troubleshooting & Support](https://devcenter.heroku.com/categories/troubleshooting)