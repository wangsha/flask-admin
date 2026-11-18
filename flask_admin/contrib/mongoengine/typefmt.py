import typing as t

from gridfs import GridOut
from markupsafe import escape
from markupsafe import Markup
from mongoengine.base import BaseDocument
from mongoengine.base import BaseList
from mongoengine.base import EmbeddedDocumentList
from mongoengine.document import EmbeddedDocument
from mongoengine.fields import GridFSProxy
from mongoengine.fields import ImageGridFsProxy

from flask_admin.model.typefmt import BASE_FORMATTERS
from flask_admin.model.typefmt import DETAIL_FORMATTERS
from flask_admin.model.typefmt import detail_json_formatter
from flask_admin.model.typefmt import list_formatter

from . import helpers

if t.TYPE_CHECKING:
    from . import ModelView
else:
    ModelView = t.Any


def grid_formatter(view: ModelView, value: GridOut) -> Markup | str:
    if not value.grid_id:
        return ""

    args = helpers.make_gridfs_args(value)

    return Markup(
        (
            '<a href="%(url)s" target="_blank">'
            + '<i class="icon-file"></i>%(name)s'
            + "</a> %(size)dk (%(content_type)s)"
        )
        % {
            "url": view.get_url(".api_file_view", **args),
            "name": escape(value.name),
            "size": value.length // 1024,
            "content_type": escape(helpers.gridfs_content_type(value) or ""),
        }
    )


def grid_image_formatter(view: ModelView, value: ImageGridFsProxy) -> Markup | str:
    if not value.grid_id:
        return ""

    return Markup(
        (
            '<div class="image-thumbnail">'
            + '<a href="%(url)s" target="_blank"><img src="%(thumb)s"/></a>'
            + "</div>"
        )
        % {
            "url": view.get_url(".api_file_view", **helpers.make_gridfs_args(value)),
            "thumb": view.get_url(".api_file_view", **helpers.make_thumb_args(value)),
        }
    )


def embedded_document_text(value: EmbeddedDocument) -> str:
    """
    Readable text for an embedded document: its own ``__str__`` when the
    class defines one, otherwise its non-empty fields as ``name: value``.
    """
    if type(value).__str__ is not BaseDocument.__str__:
        return str(value)
    parts = []
    for name in value._fields_ordered:
        field_value = getattr(value, name, None)
        if field_value in (None, "", [], {}):
            continue
        if isinstance(field_value, EmbeddedDocument):
            field_value = "{" + embedded_document_text(field_value) + "}"
        elif isinstance(field_value, float):
            field_value = f"{field_value:g}"
        parts.append(f"{name}: {field_value}")
    return ", ".join(parts) or type(value).__name__


def embedded_document_formatter(
    view: ModelView, value: EmbeddedDocument, name: str
) -> str:
    return embedded_document_text(value)


def mongo_list_formatter(view: ModelView, values: BaseList, name: str) -> str:
    """Like `list_formatter`, with embedded documents shown one per ``;``."""
    if any(isinstance(v, EmbeddedDocument) for v in values):
        return "; ".join(
            embedded_document_text(v) if isinstance(v, EmbeddedDocument) else str(v)
            for v in values
        )
    return list_formatter(view, values, name)


# Mongo-specific types come first: formatters are matched with isinstance in
# order, and BaseList would otherwise be caught by the generic list formatter.
DEFAULT_FORMATTERS = {
    EmbeddedDocumentList: mongo_list_formatter,
    BaseList: mongo_list_formatter,
    EmbeddedDocument: embedded_document_formatter,
    GridFSProxy: grid_formatter,
    ImageGridFsProxy: grid_image_formatter,
    **BASE_FORMATTERS,
}


def _plain(value: t.Any) -> t.Any:
    if isinstance(value, EmbeddedDocument):
        return {
            name: _plain(getattr(value, name, None))
            for name in value._fields_ordered
            if getattr(value, name, None) not in (None, "", [], {})
        }
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    if isinstance(value, dict):
        return {k: _plain(v) for k, v in value.items()}
    return value


def detail_document_formatter(view: ModelView, value: t.Any, name: str) -> str:
    """Details pages: embedded documents as indented JSON of their fields."""
    return detail_json_formatter(view, _plain(value), name)


DEFAULT_DETAIL_FORMATTERS = {
    EmbeddedDocument: detail_document_formatter,
    BaseList: detail_document_formatter,
    **DETAIL_FORMATTERS,
}
