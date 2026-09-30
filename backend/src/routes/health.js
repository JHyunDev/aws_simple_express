router.get('/', (req, res) => {
  if (process.env.PORT === '3000') {
    return res.status(500).json({
      status: 'FAIL',
      test: 'rollback'
    });
  }

  res.json({
    status: 'OK',
    test: 'precheck-pass'
  });
});


