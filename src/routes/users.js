const express = require('express');
const { SQL } = require('../db/sql');
const mqtt = require('mqtt');

const router = express.Router();

const mqttUrl = 'mqtt://tailor.cloudmqtt.com';

const options = {
  port: 18184,
  username: 'kvuwrinm',
  password: 'tucVHt31q7Gx',
};
// const msgTopic = '#'; // subscribe to *all* topics
const client = mqtt.connect(mqttUrl, options);

console.log(client, mqtt);

client.on('connect', d => {
  if (d) {
    console.log('MQTT Connect Successfully!');
  } else {
    console.error('MQTT Connect Failed!');
  }

});

// client.on('close', function(d) {
//   console.log(d);
// });
// client.on('offline', function(d) {
//   console.log(d);
// });

// ADD DELETE UPDATE SEARCH

// user table related
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, type } = req.body;
    const { rows } = await SQL(
      `INSERT INTO public.user (email, username, password, type) VALUES ('${email}','${username}','${password}','${type}') returning userid;`,
    );
    res.status(200).json(rows[0].userid);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await SQL(`SELECT * FROM public.user where email='${email}';`);
    if (rows[0].password === password) {
      res.status(200).json(rows[0].userid);
    } else {
      res.status(500).send('Password doesn\'t match');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/getUserType', async (req, res) => {
  try {
    const { userid } = req.body;
    const { rows } = await SQL(`SELECT type FROM public.user where userid='${userid}';`);
    res.status(200).json(rows[0].type);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/updateUser', async (req, res) => {
  try {
    const { userid, email, username, password, type, link, firstname, lastname } = req.body;
    const { rows } = await SQL(
      `UPDATE public.user SET email = '${email}', username = '${username}'
      , password = '${password}', type = '${type}', link = '${link}', firstname = '${firstname}', lastname = '${lastname}' WHERE userid = '${userid}';`,
    );
    console.log(rows);
    res.status(200).send('Success');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/updateUserAvatar', async (req, res) => {
  try {
    const { userid, link, token } = req.body;
    const { rows } = await SQL(
      `UPDATE public.user SET  link = '${link}&token=${token}' WHERE userid = '${userid}';`,
    );
    if (rows.length === 0) {
      res.status(200).send('Success');
    } else {
      res.status(500).send('Failed');
    }

  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/getUserProfile', async (req, res) => {
  try {
    const { userid } = req.body;
    const { rows } = await SQL(`SELECT * FROM public.user where userid='${userid}';`);
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// not suggested, might be violating foreign key constraints
router.post('/deleteUser', async (req, res) => {
  try {
    const { userid } = req.body;
    const { rows } = await SQL(`DELETE FROM public.user where userid='${userid}';`);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// deal table related
router.get('/getDeals', async (req, res) => {
  try {
    let tempdate = new Date().toLocaleDateString();
    const { rows } = await SQL(`SELECT * FROM public.deal WHERE expiry >= '${tempdate}';`);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/addDeal', async (req, res) => {
  try {
    const { name, desp, link, userid, expiry } = req.body;
    const { rows } = await SQL(
      `INSERT INTO public.deal (name, desp, link, userid, expiry) VALUES ('${name}','${desp}','${link}','${userid}','${expiry}') returning dealid;`,
    );
    res.status(200).json(rows[0].dealid);
    client.publish('notification', `There is a new timed deal ${name}: ${desp}! Go check it out!`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/deals/:dealid', async (req, res) => {
  try {
    const { dealid } = req.params;
    let tempdate = new Date().toLocaleDateString();
    const { rows } = await SQL(`SELECT * FROM public.deal WHERE dealid = '${dealid}' AND expiry >= '${tempdate}';`);
    if (rows.length === 0) {
      res.render('users.ejs', { title: 'This deal has expired or does not exist!', dealid: dealid });
      //res.status(200).send('This deal has expired or does not exist!');
    } else {
      res.render('users.ejs', { title: 'This deal is verified successfully!', dealid: dealid });
      //res.status(200).send('This deal is verified successfully!');
    }


  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/searchDeals', async (req, res) => {
  try {
    const { keyword } = req.body;
    const { rows } = await SQL(
      `SELECT * FROM public.deal WHERE name ~* '${keyword}';`,
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// coupon table related
// router.post('/getCouponByDID', async (req, res) => {
//   try {
//     const { dealid } = req.body;
//     const { rows } = await SQL(`SELECT * FROM public.coupon WHERE dealid = '${dealid}';`);
//     res.status(200).json(rows);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });
//
// router.post('/getCouponByUID', async (req, res) => {
//   try {
//     const { userid } = req.body;
//     const { rows } = await SQL(`SELECT * FROM public.coupon WHERE userid = '${userid}';`);
//     res.status(200).json(rows);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });
//
// router.post('/addCoupon', async (req, res) => {
//   try {
//     const { dealid, userid, link, number } = req.body;
//
//     let response = [];
//
//     for (let i = 0; i < number; i++) {
//       const { rows } = await SQL(
//         `INSERT INTO public.coupon (dealid, userid, link) VALUES ('${dealid}','${userid}','${link}') returning couponid;`,
//       );
//       response.push(rows[0].couponid);
//     }
//     res.status(200).json(response);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

// menu table related
router.get('/getMenus', async (req, res) => {
  try {
    const { rows } = await SQL(`SELECT * FROM public.menu;`);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/addMenu', async (req, res) => {
  try {
    const { link, userid } = req.body;
    const { rows } = await SQL(
      `INSERT INTO public.menu (link, userid) VALUES ('${link}','${userid}') returning menuid;`,
    );
    res.status(200).json(rows[0].menuid);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// saved deal table related
router.post('/getSavedDeals', async (req, res) => {
  try {
    const { userid } = req.body;
    const { rows } = await SQL(`SELECT * FROM public.saved_deal A RIGHT JOIN public.deal B ON A.dealid = B.dealid WHERE A.userid = '${userid}';`);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/addSavedDeal', async (req, res) => {
  try {
    const { userid, dealid } = req.body;
    const { rows } = await SQL(
      `INSERT INTO public.saved_deal (userid, dealid) VALUES ('${userid}','${dealid}');`,
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


module.exports = router;
