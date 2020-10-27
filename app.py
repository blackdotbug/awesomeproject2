from flask import Flask, render_template, redirect, url_for, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
import updatedb

app = Flask(__name__)
CORS(app)

app.config["DEBUG"] = True

app.config["MONGO_URI"] = "mongodb://localhost:27017/awesomedb"
mongo = PyMongo(app)
servicerequests = mongo.db.servicerequests

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1/home")
def apiHome():
    return render_template("api.html")

@app.route("/api/v1/update/", defaults={'month': '1'})
@app.route("/api/v1/update/<month>", methods=['GET','POST'])
def updateDB(month):
    updatedb.updateDB(servicerequests, month)
    return redirect(url_for('index'))
    
@app.route("/api/v1/data", methods=['GET'])
def serveData():
    return jsonify(list(servicerequests.find({ },
   { '_id': 0})))

if __name__ == "__main__":
    app.run(debug=True)

