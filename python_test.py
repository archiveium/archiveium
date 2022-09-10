import imaplib
import os
import re

list_response_pattern = re.compile(r'\((?P<flags>.*?)\) "(?P<delimiter>.*)" (?P<name>.*)')

def parse_list_response(line):
    flags, delimiter, mailbox_name = list_response_pattern.match(line).groups()
    mailbox_name = mailbox_name.strip('"')
    return (flags, delimiter, mailbox_name)

def open_connection(verbose=False):
    # Connect to the server
#     connection = imaplib.IMAP4_SSL('imap.gmail.com')
#     connection = imaplib.IMAP4_SSL('imappro.zoho.com')
    connection = imaplib.IMAP4_SSL('outlook.office365.com')

    # Login to our account
    connection.login('', '')
    return connection

if __name__ == '__main__':
    c = open_connection()
    try:
        print(c.status('Test Folder', '(MESSAGES RECENT UIDNEXT UIDVALIDITY UNSEEN)'))
#         typ, data = c.list()
#         for line in data:
#             print(line)
    finally:
        c.logout()

