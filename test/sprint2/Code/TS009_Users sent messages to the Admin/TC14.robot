*** Settings ***
Library    SeleniumLibrary
Suite Setup       Setup Browser
Suite Teardown    Close Browser

*** Variables ***
${URL}              http://localhost:3001/login
${REPORT_URL}       http://localhost:3001/myReports
${BROWSER}          chrome
${USERNAME}       Passenger
${PASSWORD}       t1234567
${CHAT_MESSAGE}     ภาพหลักฐานเพิ่มเติม
${IMAGE_PATH}     ${CURDIR}/test.jpg

*** Test Cases ***
Users Send Chat Message To Admin Successfully
    Login As User
    Open My Reports
    Open Chat
    Send Chat Message And Image
    Verify Message Sent

*** Keywords ***
Setup Browser
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s

Login As User
    Wait Until Element Is Visible    id=identifier    15s

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}

    Click Element    xpath=//button[@type="submit"]
    Wait Until Page Does Not Contain Element    id=identifier    15s

Open My Reports
    Go To    ${REPORT_URL}
    Wait Until Location Contains    myReports    10s

Open Chat
    Wait Until Element Is Visible    xpath=(//button[normalize-space()="แชท"])[1]    20s
    Scroll Element Into View         xpath=(//button[normalize-space()="แชท"])[1]
    Capture Page Screenshot    before_open_chat.png

    Click Element    xpath=(//button[normalize-space()="แชท"])[1]
    Wait Until Page Contains    แชทรายงาน    10s
    Capture Page Screenshot    chat_opened.png

Send Chat Message And Image

    Wait Until Element Is Visible
    ...    xpath=//input[contains(@placeholder,"พิมพ์ข้อความ")]
    ...    10s

    Input Text
    ...    xpath=//input[contains(@placeholder,"พิมพ์ข้อความ")]
    ...    ${CHAT_MESSAGE}

    Choose File
    ...    xpath=//label[@title="แนบรูปภาพ/ไฟล์"]//input
    ...    ${IMAGE_PATH}

    Capture Page Screenshot    message_and_image_ready.png

    Sleep    2s

    
    Press Keys
    ...    xpath=//input[contains(@placeholder,"พิมพ์ข้อความ")]
    ...    ENTER

         Sleep    20s

    Capture Page Screenshot    message_sent.png

Verify Message Sent

    Wait Until Page Contains
    ...    ${CHAT_MESSAGE}
    ...    20s

    Capture Page Screenshot    verify_chat_success.png