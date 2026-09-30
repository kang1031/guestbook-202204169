# Guestbook

A mini guestbook where anyone can leave an entry without signing up; each entry is guarded only by the password typed when it was written.

## Language

**Entry** (글):
One item in the guestbook: an author name, a message, and the time it was written, guarded by its own password.
_Avoid_: Post, 게시물, comment, 댓글

**Message** (메시지):
The body text of an Entry, and the only part of an Entry that can be edited.
_Avoid_: Content, body, 내용

**Author name** (작성자 이름):
The display name typed when writing an Entry. It is a label, not an identity: two Entries with the same Author name have nothing to do with each other.
_Avoid_: Author, user, 작성자, 글쓴이

**Entry password** (비밀번호):
The secret typed when writing an Entry, which is the sole proof of the right to edit or delete that one Entry.
_Avoid_: User password, account password
