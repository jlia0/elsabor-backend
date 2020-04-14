const express = require('express');
// const action = require('../actions/actions');
// var crypto = require('crypto');
const { SQL } = require('../db/sql');

const router = express.Router();

// router.get('/device', (req, res) => {
//   action
//     .getDevices()
//     .then(rtn => {
//       res.send(rtn);
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500);
//       res.send({ error: err });
//     });
// });
//
// router.post('/device', async (req, res) => {
//   try {
//     const { deviceId, deviceStatus } = req.body;
//     const { rows } = await SQL(`update device set device_status=${deviceStatus} where device_id=${deviceId}`);
//     res.status(200).json({ rows });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get('/broker', (req, res) => {
//   action
//     .getBroker()
//     .then(rtn => {
//       res.send(rtn);
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500);
//       res.send({ error: err });
//     });
// });

router.post('/register', async (req, res) => {
  try {
    const { email, username, password, type } = req.body;
    // eslint-disable-next-line no-unused-vars
    const { rows } = await SQL(
      `INSERT INTO public.user (email, username, password, type) VALUES ('${email}','${username}','${password}','${type}');`
    );
    res.status(200).json('Success');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await SQL(`SELECT password FROM public.user where email='${email}';`);
    if (rows[0].password === password) {
      // console.log('Login success');
      res.status(200).send('Success');
    } else {
      // console.log('Login failed: pwd');
      res.status(500).send("Password doesn't match");
    }
  } catch (err) {
    // console.log(`Login failed ${err.message}`);
    res.status(500).send(err.message);
  }
});

router.post('/getUserType', async (req, res) => {
  try {
    const { email } = req.body;
    const { rows } = await SQL(`SELECT type FROM public.user where email='${email}';`);
    res.status(200).send(rows[0].type.toString());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
