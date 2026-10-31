from flask import Flask

from flask_admin import Admin
from flask_admin.menu import MenuLink
from flask_admin.theme import Bootstrap4Theme
from flask_admin.theme import GraphiteTheme

FONT_AWESOME_CSS = "font-awesome.min.css"


def get_index_html(app: Flask) -> str:
    rv = app.test_client().get("/admin/")
    assert rv.status_code == 200
    return rv.data.decode("utf-8")


def test_bootstrap4_loads_font_awesome(app: Flask, babel: object | None) -> None:
    Admin(app, theme=Bootstrap4Theme())

    assert FONT_AWESOME_CSS in get_index_html(app)


def test_graphite_skips_font_awesome(app: Flask, babel: object | None) -> None:
    Admin(app, theme=GraphiteTheme())

    html = get_index_html(app)
    assert "admin/css/graphite.css" in html
    assert FONT_AWESOME_CSS not in html


def test_graphite_loads_font_awesome_for_fa_menu_icon(
    app: Flask, babel: object | None
) -> None:
    admin = Admin(app, theme=GraphiteTheme())
    # Nested in a category to cover the recursive menu check.
    admin.add_link(
        MenuLink(
            "Docs", url="/docs", category="Help", icon_type="fa", icon_value="fa-book"
        )
    )

    assert FONT_AWESOME_CSS in get_index_html(app)
