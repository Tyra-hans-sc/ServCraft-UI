import { colors, layout } from '../../theme';
import time from '../../utils/time';
import {Button, Flex, Loader, Switch, Tooltip, rem, ActionIcon} from "@mantine/core";
import ScTextAreaControl from "../sc-controls/form-controls/v2/ScTextAreaControl";
import { IconSend, IconUser, IconUsers } from "@tabler/icons";
import KendoTooltip from '../kendo/kendo-tooltip';
import { useState, useEffect, useRef } from 'react';
import helper from '../../utils/helper';
import useRefState from '../../hooks/useRefState';
import Fetch from '../../utils/Fetch';
import storage from '../../utils/storage';
import * as Enums from '../../utils/enums';
import SCTextArea from '../sc-controls/form-controls/sc-textarea';
import { useContext } from 'react';
import SubscriptionContext from '../../utils/subscription-context';
import PageContext from '../../utils/page-context';
import CommentService from '../../services/comment/comment-service';
import constants from '../../utils/constants';
import { useMantineTheme } from '@mantine/core';
import PS from '@/services/permission/permission-service';
import SCSplitButton from '../sc-controls/form-controls/sc-split-button';
import {IconPencil} from "@tabler/icons-react";

function ItemComments({ itemID, module, storeID, setTotalComments, setUnsavedComment, triggerSave }) {

  const theme = useMantineTheme();
  const subscriptionContext = useContext<any>(SubscriptionContext);
  const [submitting, setSubmitting] = useState(false);
  const [commentsPage, setCommentsPage, getCommentsPageValue] = useRefState(0);
  const [loading, setLoading] = useState(false);
  const [canLoadMoreComments, setCanLoadMoreComments] = useState(false);
  const [newComment, setNewComment, getNewCommentValue] = useRefState('');
  const [comments, setComments] = useState<any[]>([]);
  const [hasEmployee, setHasEmployee] = useState(false);
  const pageContext = useContext(PageContext);
  const prevTriggerSave = useRef(triggerSave);
  const [hasCommentPermission] = useState(PS.hasPermission(Enums.PermissionName.Comment));
  const [hasAllowPublicCommentsPermission] = useState(PS.hasPermission(Enums.PermissionName.AllowPublicComments));
  const [hasEditCommentsPermission] = useState(PS.hasPermission(Enums.PermissionName.EditComments));
  const [editingComment, setEditingComment] = useState<any>(null);

  const pageSize = 10;

  const canSubmit = () => {
    return subscriptionContext && subscriptionContext.AccessStatus !== Enums.AccessStatus.LockedWithAccess && subscriptionContext.AccessStatus !== Enums.AccessStatus.LockedWithOutAccess;
  };

  useEffect(() => {
    if (prevTriggerSave.current !== triggerSave) {
      submitComment(false);
    }
  }, [triggerSave]);

  const loadMoreComments = () => {
    if (loading) return;
    let newCommentsPage = getCommentsPageValue() + 1;
    setCommentsPage(newCommentsPage);
    fetchComments();
  };

  const handleCommentChange = (e) => {
    setNewComment(e.value);
    updateUnsavedComment();
  };

  async function fetchComments() {
    setLoading(true);
    const request = await CommentService.getComments(itemID, getCommentsPageValue(), pageSize);

    let newComments: any[] = getCommentsPageValue() === 0 ? [] : [...comments];
    newComments.push(...request.Results);
    setComments(newComments);
    setTotalComments && setTotalComments(request.TotalResults);

    if (request.ReturnedResults < pageSize) {
      setCanLoadMoreComments(false);
    } else if (newComments.length === request.TotalResults) {
      setCanLoadMoreComments(false);
    } else {
      setCanLoadMoreComments(true);
    }
    setLoading(false);
  }


  const submitComment = async (isPublic: boolean) => {

    if (!canSubmit()) return;

    if (!helper.isNullOrWhitespace(newComment)) {
      setSubmitting(true);
      await CommentService.createComment(newComment, module, itemID, storeID, isPublic);
      setComments([]);
      setCommentsPage(0);
      // console.log("submitComment");
      fetchComments();
      setNewComment('');
      setSubmitting(false);
      updateUnsavedComment();
    }
  };

  useEffect(() => {
    setHasEmployee(storage.hasCookieValue(Enums.Cookie.employeeID));
    setComments([]);
    setCommentsPage(0);
    // console.log("useEffect []");
    fetchComments();
  }, []);

  const updateUnsavedComment = () => {
    setUnsavedComment && setUnsavedComment(!!getNewCommentValue());
  };

  const [focused, setFocused] = useState(false);

  const updateComment = async (item: any) => {
    if (!canSubmit()) return;

    let itemToSave = {
      ...item
    };

    setSubmitting(true);
    setEditingComment(null);

    let commentResult = await CommentService.updateComment(itemToSave);

    if (commentResult) {
      let commentsToSave = [...comments];
      let idx = commentsToSave.findIndex(x => x.ID === item.ID);

      if (commentResult.IsActive) {
        // update comments
        commentsToSave[idx] = commentResult;
      }
      else {
        //delete from comments
        commentsToSave.splice(idx, 1);
      }

      setComments(commentsToSave);
    }
    setSubmitting(false);
  }

  const toggleItemVisibility = async (item: any) => {
    if (!canSubmit()) return;

    let itemToSave = {
      ...item,
      CustomerView: !item.CustomerView
    };

    setSubmitting(true);
    let commentResult = await CommentService.updateComment(itemToSave);

    let commentsToSave = [...comments];
    let idx = commentsToSave.findIndex(x => x.ID === item.ID);
    commentsToSave[idx] = commentResult;
    setComments(commentsToSave);

    setSubmitting(false);
  }

  return (
    <div className="container">


      <div className="new-comment">


        <div style={{ flexGrow: 1 }}>
          <SCTextArea
            label='Comments'
            placeholder="Write your comment..."
            onChange={handleCommentChange}
            value={newComment}
            readOnly={!canSubmit()}
            disabled={!hasCommentPermission}
            customProps={{
              maw: constants.maxFormWidth
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

        </div>

        <div className="footer">

          <SCSplitButton
            disabled={!newComment || !canSubmit() || submitting || !hasCommentPermission}
            items={[
              {
                key: "1",
                label: "Save Internal Comment",
                defaultItem: true,
                disabled: false,
                leftSection: submitting &&
                  <Loader size={19} />
                  ||
                  <IconSend size={19} />,
                action: () => {
                  submitComment(false);
                },
                title: "Save comment which is intended for internal operations"
              },
              {
                key: "2",
                label: "Save Public Comment",
                defaultItem: false,
                disabled: !hasAllowPublicCommentsPermission,
                leftSection: <IconUsers height={20} color={theme.colors.teal[6]} />,
                action: () => {
                  submitComment(true);
                },
                title: !hasAllowPublicCommentsPermission ? "You do not have permission to save public comments" : "Save comment which is customer-facing"
              }
            ]}
          />
        </div>
      </div>
      <div className="comment-list-container">
        {(!hasEmployee && comments ? comments.filter(x => true/*x.UserType === Enums.UserType.Supplier*/) : comments).sort((a, b) => a.CreatedDate - b.CreatedDate).map(function (item, index) {
          return (
            <div className="comment" key={index}>

              <div className="comment-info">
                <div className="name">
                  {item.CreatedBy}
                </div>
                <div title={`${time.toISOString(item.CreatedDate, false, true)}`} className="time">
                  {time.toISOString(item.CreatedDate, false, true, false)} {item.EditedDate ? "(Edited)" : ""}
                </div>
              </div>

              {editingComment?.ID === item.ID ? <>

                <div className="edit-comment-container">
                  <SCTextArea
                    value={editingComment.CommentText}
                    onChange={(e) => setEditingComment(ec => {
                      return {
                        ...ec,
                        CommentText: e.value
                      };
                    })}
                    autoFocus={true}
                    onFocus={(e) => {
                      // resets the caret to the end by simulating a full text re-input 
                      let val = e.currentTarget.value;
                      e.currentTarget.value = "";
                      e.currentTarget.value = val;
                    }}
                    customProps={{
                      maw: "100%"
                    }}
                  />
                  <div className="edit-comment-buttons">
                    <Button variant='subtle' style={{ color: "red" }} onClick={() => updateComment({
                      ...editingComment,
                      IsActive: false
                    })}>Delete</Button>
                    <div>
                      <Button variant="subtle" onClick={() => setEditingComment(null)}>Cancel</Button>
                      <Button onClick={() => updateComment(editingComment)}>Save</Button>
                    </div>

                  </div>
                </div>

              </> : <>





                <div className="text">
                  {item.CommentText}
                </div>

                <div className="visibility-tag">
                    {hasEditCommentsPermission && <Tooltip label={'Edit comment'} color={'scBlue'} openDelay={500}><ActionIcon radius={'xl'} size={'md'} variant={'light'} color={'gray.7'} mr={7} onClick={() => {
                    setEditingComment({ ...item });
                  }}><IconPencil size={18} /></ActionIcon></Tooltip>
                  }

                  {/* TODO: refactor this into a component which reuses existing scswitch code */}
                  <Switch
                    // title={hasAllowPublicCommentsPermission && canSubmit() ? (item.CustomerView ? "Make internal" : "Make public") : ""}
                    onLabel="Public"
                    offLabel="Internal"
                    checked={item.CustomerView}
                    size={'lg'}
                    color={theme.colors.teal[6]}
                    disabled={submitting || !canSubmit()}
                    onChange={() => hasAllowPublicCommentsPermission && canSubmit() && toggleItemVisibility(item)}
                    thumbIcon={
                      item.CustomerView ? (
                        <IconUsers
                          style={{ width: rem(12), height: rem(12) }}
                          color={theme.colors.teal[6]}
                          stroke={3}
                        />
                      ) : (
                        <IconUser
                          style={{ width: rem(12), height: rem(12) }}
                          stroke={3}
                        />
                      )
                    }
                  />
                </div>


              </>}


            </div>
          )
        })}

        {canLoadMoreComments || loading ?
          <div className="more" onClick={loadMoreComments}>
            {loading ? "Loading..." : "Load More"}
          </div>
          : ''
        }
      </div>



      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }
        .heading {
          color: ${colors.blueGrey};
          font-weight: bold;
          margin: 1.5rem 0 0.5rem;
        }

        .loader {
          border-color: rgba(113, 143, 162, 0.2);
          border-left-color: ${colors.blueGrey};
          display: block;
          margin-bottom: 1rem;
          margin-top: 1rem;
        }

        .comment {
          box-sizing: border-box;
          color: ${colors.blueGrey};
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0.5rem;
          position: relative;
          width: 100%;
        }

        .comment:hover {
          background-color: ${colors.formGrey}66;
        }

        .comment + .comment {
          border-top: 1px solid ${colors.mantineBorderGrey}66;
        }

        .visibility-tag {
          position: absolute;
          right: 0.25rem;
          top: 0.25rem;
          font-size: 0.6rem;
          padding: 0.2rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }

        .comment-info {
          align-items: center;
          display: flex;
          margin-bottom: 4px;
        }
        .job {
          color: ${colors.bluePrimary};
          font-weight: bold;
        }
        .name {
          color: ${colors.darkPrimary};
          font-weight: bold;
        }
        .time {
          color: ${colors.blueGrey};
          font-size: 12px;
          margin-left: 1rem;
        }
        .text {
          white-space: pre-wrap;
        }
        .more {
          cursor: pointer;
          font-weight: bold;
          color: ${colors.bluePrimary};
          width: calc(100% - 1rem);
          text-align: center;
          padding: 0.5rem;
          border-top: 1px solid ${colors.mantineBorderGrey}66;
        }
        .more:hover {
          background-color: ${colors.formGrey}66;
          box-shadow: 0 0 5px ${colors.formGrey};
        }

        .new-comment :global(.mantine-Textarea-input) {
          border-bottom-right-radius: 0;
          border-bottom-left-radius: 0;
        } 

        .footer {
          width: 100%;
          background: var(--form-grey-color);
          display: flex;
          max-width: ${constants.maxFormWidth};
          border: 1px solid ${focused ? colors.mantineBorderBlue : colors.mantineBorderGrey};
          box-sizing: border-box;
          padding: 4px;
          justify-content: end;
          margin-top: -1px;
        }

        .comment-list-container {
          width: 100%;
          max-width: ${constants.maxFormWidth};
          border: 1px solid ${colors.mantineBorderGrey};
          border-top: none;
          border-bottom-right-radius: ${theme.radius.sm}px;
          border-bottom-left-radius: ${theme.radius.sm}px;
          box-sizing: border-box;
        }

        .edit-button {
          position: absolute;
          right: 5rem;
          padding: 0.5rem;
          background: #00000010;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          opacity: 0;
        }

        .comment:hover .edit-button {
          opacity: 1;
        }

        .edit-comment-container {
          width: 100%;
        }

        .edit-comment-buttons {
          margin-top: 0.5rem;
          display: flex;
          justify-content: space-between;
        }

      `}</style>
    </div>
  )
}

export default ItemComments;
