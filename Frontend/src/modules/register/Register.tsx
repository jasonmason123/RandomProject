import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { setWindowClass } from '@app/utils/helpers';
import { Form, InputGroup } from 'react-bootstrap';
import { Checkbox } from '@profabric/react-components';

import { Button } from '@app/styles/common';
import { authenticationApiCaller } from '@app/services/api_caller/authentication-api-caller';
import { checkStrongPassword } from '@app/utils/common';

const Register = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [isGoogleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [isFacebookAuthLoading, setFacebookAuthLoading] = useState(false);
  const [t] = useTranslation();

  const navigate = useNavigate();

  const register = async (email: string, password: string) => {
    try {
      setAuthLoading(true);

      await authenticationApiCaller.signUp({
        email: email,
        password: password,
      }, true)
        .then(async (response) => {
          if (response.ok) {
            // Navigate to the verification page
            const confirmationToken = await response.text();
            navigate(`/verify-account/${confirmationToken}`);

          } else {
            response.text().then((data) => {
              console.error("Sign up api error: ", data);
              toast.error(data || "Register unsuccessful. Please try again.");
            });
          }
        });
    } catch (error) {
      console.error("Sign up error: ", error);
      toast.error("An exception had occurred. Please try again later.");
    } finally {
      setAuthLoading(false);
    }
  };

  const registerByGoogle = async () => {
    try {
      setGoogleAuthLoading(true);
      await authenticationApiCaller.signInWithGoogle(true);
      setGoogleAuthLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed');
      setGoogleAuthLoading(false);
    }
  };

  const registerByFacebook = async () => {
    try {
      setFacebookAuthLoading(true);
      throw new Error('Not implemented');
    } catch (error: any) {
      setFacebookAuthLoading(false);
      toast.error(error.message || 'Failed');
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, submitForm } =
    useFormik({
      initialValues: {
        email: '',
        password: '',
        passwordRetype: '',
      },
      validationSchema: Yup.object({
        email: Yup.string().email('Invalid email address').required('Required'),
        password: Yup.string()
          .min(8, 'Must be 8 characters or more')
          .max(30, 'Must be 30 characters or less')
          .test('is-strong-password',
            'Password must have at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (! @ # $ % ^ & * ( ) , . ? " : { } | < >)',
            (value) => {
              if (!value) return false;
              return checkStrongPassword(value);
            })
          .required('Required'),
        passwordRetype: Yup.string()
          .min(8, 'Must be 8 characters or more')
          .max(30, 'Must be 30 characters or less')
          .oneOf([Yup.ref('password')], 'Passwords must match')
          .required('Required'),
      }),
      onSubmit: (values) => {
        register(values.email, values.password);
      },
    });

  setWindowClass('hold-transition register-page');

  return (
    <div className="register-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h1">
            <b>CodLUCK</b>
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg">{t('register.registerNew')}</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange}
                  value={values.email}
                  isValid={touched.email && !errors.email}
                  isInvalid={touched.email && !!errors.email}
                />
                {touched.email && errors.email ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-envelope" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
                  isValid={touched.password && !errors.password}
                  isInvalid={touched.password && !!errors.password}
                />
                {touched.password && errors.password ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>

            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="passwordRetype"
                  name="passwordRetype"
                  type="password"
                  placeholder="Retype password"
                  onChange={handleChange}
                  value={values.passwordRetype}
                  isValid={touched.passwordRetype && !errors.passwordRetype}
                  isInvalid={touched.passwordRetype && !!errors.passwordRetype}
                />

                {touched.passwordRetype && errors.passwordRetype ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.passwordRetype}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>

            <div className="row">
              <div className="col-7">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    id='terms'
                    checked={false}
                  />
                  <label
                    style={{ margin: 0, padding: 0, paddingLeft: '4px' }}
                    htmlFor='terms'
                  >
                    <span>I agree to the </span>
                    <Link to="/">terms</Link>{' '}
                  </label>
                </div>
              </div>
              <div className="col-5">
                <Button
                  onClick={submitForm}
                  loading={isAuthLoading}
                  disabled={isGoogleAuthLoading || isFacebookAuthLoading}
                >
                  {t('register.label')}
                </Button>
              </div>
            </div>
          </form>
          <div className="social-auth-links text-center">
            <Button
              className="mb-2"
              onClick={registerByFacebook}
              loading={isFacebookAuthLoading}
              disabled={true || isAuthLoading || isGoogleAuthLoading}
            >
              <i className="fab fa-facebook mr-2" />
              {t('login.button.signIn.social', {
                what: 'Facebook',
              })}
            </Button>
            <Button
              variant="danger"
              onClick={registerByGoogle}
              loading={isGoogleAuthLoading}
              disabled={isAuthLoading || isFacebookAuthLoading}
            >
              <i className="fab fa-google mr-2" />
              {t('login.button.signUp.social', { what: 'Google' })}
            </Button>
          </div>
          <Link to="/login" className="text-center">
            {t('register.alreadyHave')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
