const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');
const contactsPath = path.join(__dirname, "contacts.json");
const {Contact} = require('./contact')


const listContacts = async () => {
   const data = await fs.readFile(contactsPath);
   return JSON.parse(data);
}

const getContactById = async (contactId) => {
   const contacts = await listContacts();
   const result = contacts.find((item) => item.id === contactId);
   return result || null;
}

const removeContact = async (contactId) => {
   const contacts = await listContacts();
   const index = contacts.findIndex((item) => item.id === contactId);
   if (index === -1) {
     return null;
   }
   const [result] = contacts.splice(index, 1);
   await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
   return result;
}

const addContact = async ({ name, email, phone }) => {
  const contacts = await listContacts();
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((item) => item.id === contactId);
  if (index === -1) {
    return null;
  }
  contacts[index] = { contactId, ...body };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[index];
};

const updateStatusContact = async (req, res) => {
  const { _id: owner } = req.user;

  const { contactId } = req.params;
  const { favorite } = req.body;
  const contact = await Contact.findOneAndUpdate(
    { owner, _id: contactId },
    { favorite },
    { new: true }
  );
  if (!contact) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(200).json({ contact });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
};
