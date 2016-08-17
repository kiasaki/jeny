import os
import sys
from flask import Flask, redirect, url_for, flash, render_template
from werkzeug.contrib.fixers import ProxyFix
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer.backend.sqla import OAuthConsumerMixin, SQLAlchemyBackend
from flask_dance.consumer import oauth_authorized, oauth_error
from flask_login import (
    LoginManager, UserMixin, current_user,
    login_required, login_user, logout_user
)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)
app.secret_key = os.environ.get("SECRET_KEY", "supersekrit")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///jeny.db")
app.config["GOOGLE_OAUTH_CLIENT_ID"] = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
app.config["GOOGLE_OAUTH_CLIENT_SECRET"] = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
blueprint = make_google_blueprint(scope=["profile", "email"])
app.register_blueprint(blueprint, url_prefix="/login")

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), unique=True)

class OAuth(db.Model, OAuthConsumerMixin):
    user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    user = db.relationship(User)

# setup login manager
login_manager = LoginManager()
login_manager.login_view = 'google.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

blueprint.backend = SQLAlchemyBackend(OAuth, db.session, user=current_user)

AUTHORIZED_EMAILS = os.environ.get("AUTHORIZED_EMAILS", "").split(",")
AUTHORIZED_EMAIL_DOMAINS = os.environ.get("AUTHORIZED_EMAIL_DOMAINS", "").split(",")

def valid_email(user_email):
    for email in AUTHORIZED_EMAILS:
        if email != "" and email == user_email:
            return True

    user_email_domain = user_email.split("@").pop()

    for email_domain in AUTHORIZED_EMAIL_DOMAINS:
        if email_domain != "" and email_domain == user_email_domain:
            return True

    return False

@oauth_authorized.connect_via(blueprint)
def google_logged_in(blueprint, token):
    if not token:
        flash("Failed to log in with {name}".format(name=blueprint.name))
        return
    # figure out who the user is
    resp = blueprint.session.get("/plus/v1/people/me")
    if resp.ok:
        email = resp.json()["emails"][0]["value"]

        if not valid_email(email):
            msg = "Your account email ({email}) is not authorized.".format(email=email)
            flash(msg, category="error")
            return


        query = User.query.filter_by(email=email)
        try:
            user = query.one()
        except NoResultFound:
            # create a user
            user = User(email=email)
            db.session.add(user)
            db.session.commit()
        login_user(user)
        flash("Successfully signed in")
    else:
        msg = "Failed to fetch user info from {name}".format(name=blueprint.name)
        flash(msg, category="error")

@oauth_error.connect_via(blueprint)
def google_error(blueprint, error, error_description=None, error_uri=None):
    msg = (
        "OAuth error from {name}! "
        "error={error} description={description} uri={uri}"
    ).format(
        name=blueprint.name,
        error=error,
        description=error_description,
        uri=error_uri,
    )
    flash(msg, category="error")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have logged out")
    return redirect(url_for("index"))

@app.route("/")
def index():
    return render_template("index.html")

# hook up extensions to app
db.init_app(app)
login_manager.init_app(app)

if __name__ == "__main__":
    if "--setup" in sys.argv:
        with app.app_context():
            db.create_all()
            db.session.commit()
            print("Database tables created")
    else:
        app.run(debug=True)
