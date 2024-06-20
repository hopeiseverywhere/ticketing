// this file is for define the mongoose User model
import mongoose from 'mongoose';
import { PasswordManager } from '../services/password-manager';

// An interface that describes the properties
// that are required to create a new User object
// attributes required to create a new User interface
// so lower case string here is for types
interface UserAttrs {
    email: string;
    password: string;
}

// An interface that describes the properties
// that a User model has, i.e. tell TS
// there is a build function available on the User Model
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has inside the DB
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        // Take User document and turn it into JSON
        // and make the JSON response more universal
        toJSON: {
            // remove __v
            versionKey: false,
            transform(doc, ret) {
                // remap the id property
                ret.id = ret._id;
                delete ret._id;
                // remove a property off an object
                delete ret.password;
            },
        },
    }
);

// custom function build in a model
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

// middleware function
// anytime we attempt save a document to DB
// execute function
userSchema.pre('save', async function (done) {
    // check if 'password' filed in curr User document
    // has been modified
    if (this.isModified('password')) {
        // get password from this document
        const hashed = await PasswordManager.toHash(this.get('password'));
        // update it
        this.set('password', hashed);
    }
    // call the 'done' callback to signal the middleware has completed the task
    done();
});

// create the model
// <UserDoc, UserModel> -> take a UserDoc type return
// type UserModel doc
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// export the model
export { User };
