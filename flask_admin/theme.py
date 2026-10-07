import typing
from dataclasses import dataclass
from functools import partial


@dataclass
class Theme:
    folder: str  # The templates folder name to use
    base_template: str


@dataclass
class BootstrapTheme(Theme):
    """
    Bootstrap theme for Flask-Admin.

    Usage::

        t = Bootstrap4Theme(
            base_template='my_base.html', # relative your templates folder
            swatch='cerulean',
            fluid=True
        )
        admin = Admin(app, name='microblog', theme=t)
    """

    folder: typing.Literal["bootstrap4"]
    base_template: str = "admin/base.html"
    swatch: str = "default"
    fluid: bool = False
    stylesheets: tuple[str, ...] = ()


Bootstrap4Theme = partial(BootstrapTheme, folder="bootstrap4")


@dataclass
class GraphiteTheme(BootstrapTheme):
    """Dark, ivory-accented theme for dense administrative interfaces.

    Uses the existing Bootstrap 4 components and JavaScript. Styles and
    templates are bundled with Flask-Admin; no build step is needed.
    Bootstrap and vendor assets use the fork's existing jsDelivr CDN URLs.

    Usage::

        admin = Admin(app, name="My workspace", theme=GraphiteTheme())

    Override the ``--background``, ``--surface``, ``--text``, ``--muted``, and
    ``--line`` CSS variables in a view's ``extra_css`` to customize the palette.
    """

    folder: typing.Literal["bootstrap4"] = "bootstrap4"
    base_template: str = "admin/graphite_base.html"
    fluid: bool = True
    stylesheets: tuple[str, ...] = ("admin/css/graphite.css",)
