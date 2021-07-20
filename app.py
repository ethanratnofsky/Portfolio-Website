from flask import Flask, render_template

app = Flask(__name__)
app.jinja_options = {
    'trim_blocks': True,
    'lstrip_blocks': True
}

@app.route('/')
def index():
    return render_template('index.jinja2')