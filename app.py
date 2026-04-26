from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# =========================
# Database Config
# =========================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bugs.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# =========================
# Models
# =========================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default="user")


class Bug(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='Open')
    priority = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    bug_id = db.Column(db.Integer, db.ForeignKey('bug.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

# =========================
# Routes
# =========================

@app.route("/")
def home():
    return "Flask is working!"

# =========================
# 🔐 Register
# =========================

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing data"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = generate_password_hash(data["password"])

    user = User(
        name=data["name"],
        email=data["email"],
        password=hashed_password,
        role=data.get("role", "user")
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created successfully"})

# =========================
# 🔐 Login
# =========================

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if user and check_password_hash(user.password, data["password"]):
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        })
    else:
        return jsonify({"message": "Invalid email or password"}), 401

# =========================
# 📥 Get All Users
# =========================

@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()

    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        })

    return jsonify(result)

# =========================
# 🐞 Create Bug
# =========================

@app.route("/bugs", methods=["POST"])
def create_bug():
    data = request.get_json()

    if not data or not data.get("title") or not data.get("description") or not data.get("user_id"):
        return jsonify({"message": "Missing data"}), 400

    bug = Bug(
        title=data["title"],
        description=data["description"],
        priority=data.get("priority"),
        user_id=data["user_id"]
    )

    db.session.add(bug)
    db.session.commit()

    return jsonify({"message": "Bug created successfully"})

# =========================
# 📥 Get All Bugs
# =========================

@app.route("/bugs", methods=["GET"])
def get_bugs():
    bugs = Bug.query.all()

    result = []
    for bug in bugs:
        result.append({
            "id": bug.id,
            "title": bug.title,
            "description": bug.description,
            "status": bug.status,
            "priority": bug.priority,
            "user_id": bug.user_id,
            "assigned_to": bug.assigned_to
        })

    return jsonify(result)

# =========================
# 🎯 Assign Bug
# =========================

@app.route("/bugs/<int:bug_id>/assign", methods=["PUT"])
def assign_bug(bug_id):
    data = request.get_json()

    bug = Bug.query.get(bug_id)

    if not bug:
        return jsonify({"message": "Bug not found"}), 404

    developer = User.query.get(data["developer_id"])

    if not developer or developer.role != "developer":
        return jsonify({"message": "Invalid developer"}), 400

    bug.assigned_to = developer.id
    bug.status = "Assigned"

    db.session.commit()

    return jsonify({"message": "Bug assigned successfully"})

# =========================
# 🔄 Update Status
# =========================

@app.route("/bugs/<int:bug_id>/status", methods=["PUT"])
def update_status(bug_id):
    data = request.get_json()

    bug = Bug.query.get(bug_id)

    if not bug:
        return jsonify({"message": "Bug not found"}), 404

    if not data or not data.get("status"):
        return jsonify({"message": "Missing status"}), 400

    allowed_status = ["Open", "Assigned", "In Progress", "Fixed", "Closed"]

    if data["status"] not in allowed_status:
        return jsonify({"message": "Invalid status"}), 400

    bug.status = data["status"]

    db.session.commit()

    return jsonify({"message": "Status updated successfully"})

# =========================
# 💬 Add Comment
# =========================

@app.route("/bugs/<int:bug_id>/comments", methods=["POST"])
def add_comment(bug_id):
    data = request.get_json()

    if not data or not data.get("text") or not data.get("user_id"):
        return jsonify({"message": "Missing data"}), 400

    comment = Comment(
        text=data["text"],
        bug_id=bug_id,
        user_id=data["user_id"]
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify({"message": "Comment added successfully"})

# =========================
# 📥 Get Comments
# =========================

@app.route("/bugs/<int:bug_id>/comments", methods=["GET"])
def get_comments(bug_id):
    comments = Comment.query.filter_by(bug_id=bug_id).all()

    result = []
    for c in comments:
        result.append({
            "id": c.id,
            "text": c.text,
            "user_id": c.user_id
        })

    return jsonify(result)

# =========================
# Run App
# =========================

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)