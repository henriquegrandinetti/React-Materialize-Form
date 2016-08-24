import React, { Component, PropTypes } from 'react';

import ProgressBar from './ProgressBar';

export default Form = React.createClass({

  getInitialState() {
    return {};
  },

  updateMaterializeSelect() {
    let component = this;
    this.props.fields.forEach(function(item) {
      if(item.type == "select") {
        $(component.refs[item.name]).material_select(() => component.handleSelectChange(component.refs[item.name]));
      }
    });
  },

  componentDidMount() {
    this.updateMaterializeSelect();
  },

  componentDidUpdate() {
    this.updateMaterializeSelect();
  },

  componentWillReceiveProps(nextProps) {
    if(nextProps.object) {
      let component = this;
      let object = nextProps.object;
      let object_keys = Object.keys(object);

      this.props.fields.forEach(function(field) {
        if(object[field.name]) {
          component.setState({
            [field.name]: object[field.name],
          });
        }
      });
    }
  },

  displayErrors() {
    let component = this;

    //remove old message
    this.props.fields.forEach(function (item) {
      component.setState({
        [item.name + "_error"]: "",
      });
    });

    //add new messages
    var context = this.props.schema.namedContext("form");
    context.invalidKeys().forEach(function(item) {
      component.setState({
        [item.name + "_error"]: context.keyErrorMessage(item.name)
      });
    });
  },

  validateForm() {
    let component = this;
    let context = this.props.schema.namedContext("form");
    var entry = {};

    this.props.fields.forEach(function(field){
      if(field.type == "date") {
        entry[field.name] = new Date(component.state[field.name]);
      } else {
        entry[field.name] = component.state[field.name];
      }
    });

    return context.validate(entry);
  },

  validateField(target) {
    var obj = {};
    obj[target.id] = target.value;
    return this.props.schema.namedContext("form").validateOne(obj, target.id);
  },

  handleFileChange(event, field) {
    let component = this;

    component.setState({
      [field.name + "_error"]: "",
    });

    var updateProgress = function() {
      if(field.progressFunc) {
        component.setState({
          [field.name + "_progress"]: Math.ceil((field.progressFunc() || 0) * 100)
        });
      }
    }

    let timerId = setInterval(updateProgress.bind(this, field), 200);

    field.uploadFunc(event.target.files, function(error, url) {
      clearInterval(timerId);
      component.setState({
        [field.name + "_progress"]: 0,
      });

      if(error) {
        component.setState({
          [field.name + "_error"]: "Houve um problema com o upload",
        });
      } else {
        component.setState({
          [field.name]: url,
        });
      }
    }.bind(timerId));
  },

  handleSelectChange(field) {
    this.setState({
      [field.id]: field.value
    });
  },

  handleChange(event) {
    if(event.target.type == "checkbox") {
      this.setState({[event.target.id]: event.target.checked});
    } else if (event.target.type == "radio") {
      this.setState({[event.target.name]: event.target.id});
    } else  {
      this.setState({[event.target.id]: event.target.value});
    }
  },

  handleSubmit(event) {
    event.preventDefault();

    if(!this.validateForm()) {
      var context = this.props.schema.namedContext("form");
      this.displayErrors();
      return;
    }

    let component = this;

    if(this.props.edit) {
      let updatedFields = {};
      component.props.fields.forEach(function(field) {
        updatedFields[component.props.object[field.name] != component.state[field.name] ? field.name : "undef"] = component.state[field.name];
      });
      this.props.submitFunc(this.props.object._id, updatedFields, function(error) {
        if(error) {
          component.displayErrors();
        } else if(component.props.submitSuccessFunc) {
          component.props.submitSuccessFunc();
        }
      });
    } else {
      console.log("new");
      this.props.submitFunc(this.state, function(error) {
        if(error) {
          component.displayErrors();
        } else if(component.props.submitSuccessFunc) {
          component.props.submitSuccessFunc();
        }
      });
    }
  },

  renderField(field) {
    let component = this;
    switch (field.type) {
      case "checkbox":
        let text = [];
        if(Array.isArray(field.label)) {
          field.label.forEach(function(item, index) {
            text.push(<div key={"checkbox_label_"  + index}>{item}</div>);
          });
        } else {
          text.push(<div key="checkbox_label_0">{field.label}</div>);
        }
        return(
          <div key={field.name} className="row">
            <div className="col s12">
              <input
              id={field.name}
              type={field.type}
              className={component.state[field.name + "_error"] ? "invalid" : null}
              onChange={component.handleChange}
              />

              <label htmlFor={field.name} data-error={component.state[field.name + "_error"] ? component.state[field.name + "_error"] : null}
              className={field.type == "date" ? "active" : null}>{field.label ? field.label : component.props.schema.label(field.name)}</label>

              <div className="validation-error red-text"><p>{this.state[field.name + "_error"]}</p></div>
            </div>
          </div>
        );
      case "file":
        return(
          <div key={field.name} className="row">
            <div className="col s12">
              <div className="file-field input-field">
                <div className="btn">
                  <span>{field.label ? field.label : component.props.schema.label(field.name)}</span>
                  <input type="file" onChange={(event) => component.handleFileChange(event, field)}/>
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path" type="text"/>
                </div>
              </div>
              <ProgressBar progress={this.state[field.name + "_progress"] ? this.state[field.name + "_progress"] : "0"} />
              <div className="validation-error red-text">
                <p>{this.state[field.name + "_error"]}</p>
              </div>
            </div>
          </div>
        );
      case "radio":
        let radio_options = [];
        field.options.forEach(function(option) {
          radio_options.push(
            <div key={option.value} className="col s6">
              <input
              className="with-gap"
              name={field.name}
              type="radio"
              id={option.value}
              onChange={component.handleChange}
              />
              <label htmlFor={option.value}>{option.label}</label>
            </div>
          );
        });
        return (
          <div key={field.name} className="row">
            {radio_options}
            <div className="validation-error red-text col s12"><p>{component.state[field.name + "_error"]}</p></div>
          </div>
        );
      case "select":
        let options = [];

        options.push(<option key={field.name + "_0"} value="" disabled >Escolha a editora</option>);

        field.options.forEach(function (element, index){
          options.push(<option key={element.value} value={element.value}>{element.name}</option>);
        });
        return (
          <div key={field.name} className="row">
            <div className="input-field col s12">
              <select
              id={field.name}
              ref={field.name}
              className={component.state[field.name + "_error"] ? "invalid" : null}
              value={component.state[field.name] ? component.state[field.name] : ""}>
                {options}
              </select>
              <label>{field.label ? field.label : component.props.schema.label(field.name)}</label>
            </div>
          </div>
        );
      case "textarea":
        return (
          <div key={field.name} className="row">
            <div className="input-field col s12">
              <textarea
              id={field.name}
              className={component.state[field.name + "_error"] ? "materialize-textarea invalid" : "materialize-textarea"}
              onChange={component.handleChange}
              value={component.state[field.name] ? component.state[field.name] : ""}
              />

              <label htmlFor={field.name} data-error={component.state[field.name + "_error"] ? component.state[field.name + "_error"] : null}
              className={component.state[field.name] ? "active" : null}
              >{field.label ? field.label : component.props.schema.label(field.name)}</label>
            </div>
          </div>
        );
      default:
        return (
          <div key={field.name} className="row">
            <div className="input-field col s12">
              <input
              id={field.name}
              type={field.type}
              className={component.state[field.name + "_error"] ? "invalid" : null}
              onChange={component.handleChange}
              value={component.state[field.name] ? component.state[field.name] : ""}
              />

              <label htmlFor={field.name} data-error={component.state[field.name + "_error"] ? component.state[field.name + "_error"] : null}
              className={component.state[field.name] || field.type == "date" ? "active" : null}>{field.label ? field.label : component.props.schema.label(field.name)}</label>
            </div>
          </div>
      );

    }
  },

  renderForm() {
    let component = this;
    let fields = []
    this.props.fields.forEach(function (field) {
      fields.push(
        component.renderField(field)
      );
    });

    return(
      <div className="row">
        <form className="col s12" onSubmit={this.handleSubmit}>
          {fields}
          <button className="btn waves-effect waves-light section" type="submit" name="action">
            {this.props.buttonString ? this.props.buttonString : "Cadastrar"}
          </button>
        </form>
      </div>
    );
  },

  render() {
    return (
      this.renderForm()
    );
  }
});

/*
  submitFunction ->
    If new object, single argument, which is the object state
    If edit, two arguments, object id and object with updated fields only
*/

Form.propTypes = {
  schema: PropTypes.object.isRequired, //SimpleSchema object
  edit: PropTypes.bool,
  object: PropTypes.object,
  fields: PropTypes.arrayOf(PropTypes.shape({
     name: PropTypes.string.isRequired,
     type: PropTypes.string.isRequired,
     label: PropTypes.oneOfType([
       PropTypes.string,
       PropTypes.array
     ]),
     uploadFunc: PropTypes.func,
     progressFunc: PropTypes.func,
   })).isRequired,
  submitFunc: PropTypes.func.isRequired,
  submitSuccessFunc: PropTypes.func,
  buttonString: PropTypes.string
};
