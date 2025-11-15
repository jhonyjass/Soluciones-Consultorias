import { Notify } from 'quasar';

export const ok = (msg) =>
  Notify.create({
    message: msg,
    color: 'positive',
    icon: 'check_circle',
    position: 'top-right',
    timeout: 2500
  });

export const error = (msg) =>
  Notify.create({
    message: msg,
    color: 'negative',
    icon: 'error',
    position: 'top-right',
    timeout: 3500
  });

export const info = (msg) =>
  Notify.create({
    message: msg,
    color: 'primary',
    icon: 'info',
    position: 'top-right'
  });
