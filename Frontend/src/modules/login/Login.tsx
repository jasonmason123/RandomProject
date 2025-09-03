import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { setWindowClass } from '@app/utils/helpers';
import { Checkbox } from '@profabric/react-components';
import * as Yup from 'yup';

import { Form, InputGroup } from 'react-bootstrap';
import { Button } from '@app/styles/common';
import { authenticationApiCaller } from '@app/services/api_caller/authentication-api-caller';
import { AuthenticationResult } from '@app/types/dtos';

const Login = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [isGoogleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [isFacebookAuthLoading, setFacebookAuthLoading] = useState(false);

  const navigate = useNavigate();
  const [t] = useTranslation();

  const login = async (email: string, password: string, isRemembered: boolean) => {
    try {
      setAuthLoading(true);

      await authenticationApiCaller.signIn({
        email: email,
        password: password,
      }, isRemembered)
        .then(async (response) => {
          var authenticationResult: AuthenticationResult = await response.json();

          if (response.ok) {
            // If user successfully authenticated but email not confirmed, redirect to verify account
            if(authenticationResult.isEmailConfirmed == false) {
              navigate(`/verify-account/${authenticationResult.confirmationToken}`);
            } else {
              window.location.href = "/";
            }
          } else {
            const errorMessage = authenticationResult.isLockedOut == true ?
              "You have entered the wrong password too many times. Please try again in 5 minutes." :
              "Email or password is incorrect. Please try again."
            toast.error(errorMessage);
          }
        });
    } catch (error) {
      console.error("Sign in error: ", error);
      toast.error("An exception had occurred. Please try again later.");
    } finally {
      setAuthLoading(false);
    }
  };

  const loginByGoogle = async (isRemembered: boolean) => {
    try {
      setGoogleAuthLoading(true);
      await authenticationApiCaller.signInWithGoogle(isRemembered);
      setGoogleAuthLoading(false);
    } catch (error: any) {
      setGoogleAuthLoading(false);
      toast.error(error.message || 'Failed');
    }
  };

  const loginByFacebook = async () => {
    try {
      setFacebookAuthLoading(true);
      throw new Error('Not implemented');
    } catch (error: any) {
      setFacebookAuthLoading(false);
      toast.error(error.message || 'Failed');
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, setFieldValue, submitForm } = useFormik({
    initialValues: {
      email: '',
      password: '',
      isRemembered: false,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string()
        .min(6, 'Must be 6 characters or more')
        .max(30, 'Must be 30 characters or less')
        .required('Required'),
      isRemembered: Yup.boolean(),
    }),
    onSubmit: (values) => {
      login(values.email, values.password, values.isRemembered);
    },
  });

  setWindowClass('hold-transition login-page');

  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h1">
            <b>CodLUCK</b>
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg">{t('login.label.signIn')}</p>
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

            <div className="row">
              <div className="col-8">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    id='rememberMe'
                    checked={values.isRemembered}
                    onChange={(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      setFieldValue('isRemembered', target.checked);
                    }}
                  />
                  <label
                    style={{ margin: 0, padding: 0, paddingLeft: '4px' }}
                    htmlFor='rememberMe'
                  >
                    {t('login.label.rememberMe')}
                  </label>
                </div>
              </div>
              <div className="col-4">
                <Button
                  loading={isAuthLoading}
                  disabled={isFacebookAuthLoading || isGoogleAuthLoading}
                  onClick={submitForm}
                >
                  {t('login.button.signIn.label')}
                </Button>
              </div>
            </div>
          </form>
          <div className="social-auth-links text-center mt-2 mb-3">
            <Button
              className="mb-2"
              onClick={loginByFacebook}
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
              onClick={() => loginByGoogle(values.isRemembered)}
              loading={isGoogleAuthLoading}
              disabled={isAuthLoading || isFacebookAuthLoading}
            >
              <i className="fab fa-google mr-2" />
              {t('login.button.signIn.social', { what: 'Google' })}
            </Button>
          </div>
          <p className="mb-1">
            <Link to="/forgot-password">{t('login.label.forgotPass')}</Link>
          </p>
          <p className="mb-0">
            <Link to="/register" className="text-center">
              {t('login.label.registerNew')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
