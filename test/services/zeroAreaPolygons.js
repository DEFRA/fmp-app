module.exports = [
  [
    [
      [1, 1],
      [1, 1],
      [1, 1],
      [1, 1]
    ], // zeroAreaPolygon
    [
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1],
      [1, 1]
    ], // expectedBuffedPolygon
    [
      [1, 1],
      [1, 1]
    ] // expectedMinMaxXY
  ],
  [
    [
      [1, 1],
      [2, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [2, 1]
    ]
  ],
  [
    [
      [1, 1],
      [1, 10],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 10],
      [2, 10],
      [2, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 10]
    ]
  ],
  [
    [
      [1, 1],
      [2, 1],
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [2, 1]
    ]
  ],
  [
    // y buff (will increase line width by 1 along y axis)
    [
      [1, 1],
      [5, 4],
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 2],
      [5, 5],
      [5, 4],
      [1, 1]
    ],
    [
      [1, 1],
      [5, 4]
    ]
  ],
  [
    // x buff (will increase line width by 1 along x axis)
    [
      [1, 1],
      [4, 5],
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [4, 5],
      [5, 5],
      [2, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [4, 5]
    ]
  ],
  [
    // y buff - remaining tests are actual examples from prod
    [
      [397928, 294638],
      [397928, 294638],
      [398355, 294563],
      [397928, 294638]
    ],
    [
      [397928, 294638],
      [397928, 294639],
      [398355, 294564],
      [398355, 294563],
      [397928, 294638]
    ],
    [
      [397928, 294638],
      [398355, 294563]
    ] // 427, 75 // ybuff
  ],
  [
    // y buff - (will increase line width by 1 along y axis)
    [
      [386285, 393364],
      [386285, 393364],
      [386283, 393364],
      [386285, 393364]
    ],
    [
      [386283, 393364],
      [386283, 393365],
      [386285, 393365],
      [386285, 393364],
      [386283, 393364]
    ],
    [
      [386283, 393364],
      [386285, 393364]
    ] // 2, 0 - ybuff
  ],
  [
    [
      [460138, 451501],
      [460145, 451491],
      [460141, 451503],
      [460148, 451493],
      [460138, 451501]
    ],
    [
      [460138, 451501],
      [460138, 451502],
      [460148, 451494],
      [460148, 451493],
      [460138, 451501]
    ],
    [
      [460138, 451501],
      [460148, 451493]
    ] // 10, 8 - ybuff
  ],
  [
    [
      [622185, 309905],
      [622233, 309907],
      [622185, 309905]
    ],
    [
      [622185, 309905],
      [622185, 309906],
      [622233, 309908],
      [622233, 309907],
      [622185, 309905]
    ],
    [
      [622185, 309905],
      [622233, 309907]
    ] // 48, 2 - y buff
  ]
]
