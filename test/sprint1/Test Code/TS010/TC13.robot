*** Settings ***
Library    SeleniumLibrary
Suite Setup       Setup Browser
Suite Teardown    Close Browser

*** Variables ***
${URL}              http://localhost:3001/login
${REPORT_URL}       http://localhost:3001/myReports
${BROWSER}          chrome
${USERNAME_USER}    User01
${PASSWORD_USER}    t1234567
${CHAT_MESSAGE}     เมื่อไหร่จะดำเนินการครับ

*** Test Cases ***
Users Send Chat Message To Admin Successfully
    Login As User
    Open My Reports
    Open Chat
    Send Chat Message
    Verify Message Sent

*** Keywords ***
Setup Browser
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s

Login As User
    Wait Until Element Is Visible    id=identifier    15s
    Capture Page Screenshot    step1_login_page.png

    Input Text    id=identifier    ${USERNAME_USER}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD_USER}
    Capture Page Screenshot    step2_fill_login.png

    Click Element    xpath=//button[@type="submit"]
    Wait Until Page Does Not Contain Element    id=identifier    15s
    Capture Page Screenshot    step3_login_success.png

Open My Reports
    Go To    ${REPORT_URL}
    Wait Until Location Contains    myReports    10s
    Capture Page Screenshot    step4_myreports.png

Open Chat
    Wait Until Element Is Visible    xpath=(//button[normalize-space()="แชท"])[1]    20s
    Scroll Element Into View         xpath=(//button[normalize-space()="แชท"])[1]
    Capture Page Screenshot    step5_before_open_chat.png

    Click Element    xpath=(//button[normalize-space()="แชท"])[1]
    Wait Until Page Contains    แชทรายงาน    10s
    Capture Page Screenshot    step6_chat_opened.png

Send Chat Message
    Wait Until Element Is Visible    xpath=//input[@placeholder="พิมพ์ข้อความ..."]    10s
    Clear Element Text               xpath=//input[@placeholder="พิมพ์ข้อความ..."]
    Input Text                       xpath=//input[@placeholder="พิมพ์ข้อความ..."]    ${CHAT_MESSAGE}
    Capture Page Screenshot    step7_message_typed.png

    Press Keys    xpath=//input[@placeholder="พิมพ์ข้อความ..."]    ENTER
    Capture Page Screenshot    step8_message_sent.png

Verify Message Sent
    Wait Until Page Contains Element    xpath=//*[contains(text(),"${CHAT_MESSAGE}")]    20s
    Capture Page Screenshot    step9_verify_success.png
