Materialize React Form
======================

This is a very simple React component to generate forms with Materialize style using Simple Schema.

I did not have time to document the component, but I added an example where most of the functionalities are displayed.

Example
-----

```
import Form from '<path>/Form.jsx';

//Simple Schema schema
import { Schema } from '<path>/schema.js';

class UsersForm extends Component {

    onSubmitNew(state, callback) {
        //something
        callback(error); //Callback must be called
    }

    onSubmitEdit(id, updatedFields, callback) {
        //something
        callback(error); //Callback must be called
    }

    onSubmitSuccess() {
        //redirect, for example
    }

    uploadFileFunc(files, callback) {
        //upload image and get url to store
        callback(error, url); //Callback must be called
    }

    render() {
        return (
            <Form
                schema={Schema}
                edit= {this.props.edit}
                object= {this.props.user} //only needed if edit is true
                fields={[
                  {name: "firs_name", type: "text"},
                  {name: "last_name", label: "Last Name", type: "text"},
                  {name: "country", type: "select", options: this.props.countries},
                  {name: "gender", type: "radio", options: [
                    {value: "male", label: "Male"},
                    {value: "female", label: "Female"},
                  ]},
                  {name: "birthday", type: "date"},
                  {name: "about", type: "textarea"},
                  {name: "image", type: "file", uploadFunc: this.uploadFileFunc.bind(this), progressFunc: this.props.imageProgress},
                  {name: "conditions", label:["I agree with the",<a href="#">Terms and Conditions.</a>], type: "checkbox"},
                ]}
                submitFunc={this.props.edit ? this.onSubmitEdit : this.onSubmitNew}
                submitSuccessFunc={this.onSubmitSuccess}
            />
        );
    }
};
```
