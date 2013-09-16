'use strict'

define([], function() {
  return {
    lockTimeout:         400,
    mainChatLabel:       'Main',
    renameModalSelector: '#changeName',
    renameFieldSelector: '#newName',
    currentChatSelector: '.chat-app .messages .active',
    messagesSelector:    '.chat-app .messages',
    smiles:              [
      ":)", ":]", "=]", "=)", "8)", ":}", ":D", ":(", ":[", ":{", "=(", ";)",
      ";]", ";D", ":P", ":p", "=P", "=p", ":b", ":Þ", ":O", ":/", "=/", ":S",
      ":#", ":X", "B)", ":|", ":\\", "=\\", "?-)", ":*", ":&gt;", ":&lt;",
      "&gt;:)", "&gt;;)", "&gt;:(", "&gt;: )", "&gt;; )", "&gt;: (", ";(",
      "&lt;3", "O_O", "o_o", "0_o", "O_o", "T_T", "^_^", "O:)", "O: )", "8D",
      "XD", "xD", "=D", "8O", "[+=..]"
    ]
  }
})